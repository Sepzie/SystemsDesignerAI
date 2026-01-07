import type { SupabaseClient } from '@supabase/supabase-js';

export type RateLimitType = 'user_daily' | 'global_daily' | 'input_tokens';

type RateLimitConfig = {
  userDailyLimit: number;
  globalDailyLimit: number;
  maxInputTokens: number;
  maxOutputTokens: number;
};

type DailyLimitResult = {
  allowed: boolean;
  reason?: RateLimitType;
  limit?: number;
  count?: number;
  dateKey: string;
};

function parseEnvNumber(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getRateLimitConfig(): RateLimitConfig {
  return {
    userDailyLimit: parseEnvNumber('RATE_LIMIT_USER_DAILY', 15),
    globalDailyLimit: parseEnvNumber('RATE_LIMIT_GLOBAL_DAILY', 500),
    maxInputTokens: parseEnvNumber('MAX_INPUT_TOKENS', 5000),
    maxOutputTokens: parseEnvNumber('MAX_OUTPUT_TOKENS', 5000),
  };
}

export function estimateTokens(text: string) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

export function getUtcDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

async function getCount(
  admin: SupabaseClient,
  table: 'rate_limits' | 'global_rate_limits',
  query: Record<string, string>
) {
  const builder = admin.from(table).select('count').limit(1);
  Object.entries(query).forEach(([key, value]) => {
    builder.eq(key, value);
  });
  const { data, error } = await builder.maybeSingle();
  if (error) throw error;
  return data?.count ?? 0;
}

async function setCount(
  admin: SupabaseClient,
  table: 'rate_limits' | 'global_rate_limits',
  query: Record<string, string>,
  nextCount: number
) {
  if (table === 'rate_limits') {
    const payload = { user_id: query.user_id, date: query.date, count: nextCount };
    const { error } = await admin.from(table).upsert(payload, {
      onConflict: 'user_id,date',
    });
    if (error) throw error;
    return;
  }

  const payload = { date: query.date, count: nextCount };
  const { error } = await admin.from(table).upsert(payload, { onConflict: 'date' });
  if (error) throw error;
}

export async function enforceDailyLimits(
  admin: SupabaseClient,
  userId: string
): Promise<DailyLimitResult> {
  const { userDailyLimit, globalDailyLimit } = getRateLimitConfig();
  const dateKey = getUtcDateKey();

  const userCount = await getCount(admin, 'rate_limits', {
    user_id: userId,
    date: dateKey,
  });
  if (userCount >= userDailyLimit) {
    return { allowed: false, reason: 'user_daily', limit: userDailyLimit, count: userCount, dateKey };
  }

  const globalCount = await getCount(admin, 'global_rate_limits', { date: dateKey });
  if (globalCount >= globalDailyLimit) {
    return { allowed: false, reason: 'global_daily', limit: globalDailyLimit, count: globalCount, dateKey };
  }

  await setCount(admin, 'rate_limits', { user_id: userId, date: dateKey }, userCount + 1);
  await setCount(admin, 'global_rate_limits', { date: dateKey }, globalCount + 1);

  return { allowed: true, dateKey, count: userCount + 1 };
}

export async function logRateLimitHit(
  admin: SupabaseClient,
  payload: {
    limitType: RateLimitType;
    userId?: string;
    projectId?: string;
    conversationId?: string;
    messageId?: string;
    details?: Record<string, unknown>;
  }
) {
  const { error } = await admin.from('rate_limit_hits').insert({
    user_id: payload.userId,
    project_id: payload.projectId,
    conversation_id: payload.conversationId,
    message_id: payload.messageId,
    limit_type: payload.limitType,
    details: payload.details ?? {},
  });

  if (error) {
    console.warn('[rate-limit] Failed to log limit hit:', error);
  }
}
