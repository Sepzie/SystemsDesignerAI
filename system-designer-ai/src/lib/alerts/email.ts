type RateLimitAlertPayload = {
  to: string;
  from: string;
  limitType: string;
  userId?: string;
  projectId?: string;
  conversationId?: string;
  messageId?: string;
  details?: Record<string, unknown>;
};

function getEnvValue(name: string) {
  return process.env[name]?.trim() || '';
}

export async function sendRateLimitAlert(payload: RateLimitAlertPayload) {
  const apiKey = getEnvValue('RESEND_API_KEY');
  const to = payload.to || getEnvValue('ALERT_EMAIL_TO');
  const from = payload.from || getEnvValue('ALERT_EMAIL_FROM') || 'onboarding@resend.dev';

  if (!apiKey || !to || !from) {
    console.warn('[alerts] Missing RESEND_API_KEY/ALERT_EMAIL_TO/ALERT_EMAIL_FROM, skipping alert.');
    return;
  }

  const subjectParts = [
    'System Designer AI',
    `Rate limit hit: ${payload.limitType}`,
    payload.projectId ? `project ${payload.projectId}` : '',
    payload.userId ? `user ${payload.userId}` : '',
  ].filter(Boolean);
  const subject = subjectParts.join(' | ');
  const details = payload.details ? JSON.stringify(payload.details, null, 2) : 'n/a';

  const html = `
    <div style="font-family: Inter, system-ui, -apple-system, sans-serif; color: #1f1b16;">
      <h2 style="margin: 0 0 12px;">Rate limit hit</h2>
      <p style="margin: 0 0 12px;">Type: <strong>${payload.limitType}</strong></p>
      <ul style="padding-left: 18px; margin: 0 0 12px;">
        <li>User ID: ${payload.userId || 'n/a'}</li>
        <li>Project ID: ${payload.projectId || 'n/a'}</li>
        <li>Conversation ID: ${payload.conversationId || 'n/a'}</li>
        <li>Message ID: ${payload.messageId || 'n/a'}</li>
      </ul>
      <pre style="background: #f2ebe2; padding: 12px; border-radius: 8px; white-space: pre-wrap;">${details}</pre>
    </div>
  `;

  const text = [
    `Rate limit hit (${payload.limitType})`,
    `User ID: ${payload.userId || 'n/a'}`,
    `Project ID: ${payload.projectId || 'n/a'}`,
    `Conversation ID: ${payload.conversationId || 'n/a'}`,
    `Message ID: ${payload.messageId || 'n/a'}`,
    `Details: ${details}`,
  ].join('\n');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.warn('[alerts] Failed to send alert:', errorText);
  }
}
