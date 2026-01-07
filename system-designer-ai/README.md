# AI System Designer (App)

Developer-focused notes for the Next.js app.

## Requirements
- Node.js 18+
- Supabase project (URL + keys)
- OpenAI API key
- Resend API key (for rate limit alerts)

## Setup
```bash
cd system-designer-ai
npm install
```

## Supabase (Local)
Prereqs:
- Install Docker Desktop and ensure it is running.
- Install the Supabase CLI if needed (`npm install -g supabase`).

Start the local stack from this folder:
```bash
npx supabase start
```

Apply migrations:
```bash
npx supabase migration up
```

Stop the stack:
```bash
npx supabase stop
```

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Rate limits
RATE_LIMIT_USER_DAILY=15
RATE_LIMIT_GLOBAL_DAILY=500
MAX_INPUT_TOKENS=1200
MAX_OUTPUT_TOKENS=800

# Alerts (Resend)
RESEND_API_KEY=
ALERT_EMAIL_TO=
ALERT_EMAIL_FROM=onboarding@resend.dev
```

Apply migrations (local Supabase):
```bash
npx supabase migration up
```

Run:
```bash
npm run dev
```

## Scripts
```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run test:open
npm run db:reset
npm run db:seed:test-user
npm run db:seed:test-project
```

## Key Paths
- `src/app/api/projects/[projectId]/conversations/[conversationId]/stream/route.ts` (SSE streaming + rate limiting)
- `src/lib/langchain/` (prompting + asset extraction)
- `src/components/project-workspace/` (workspace UI)
- `supabase/migrations/` (schema)

## Notes
- Rate limits require `rate_limits`, `global_rate_limits`, `rate_limit_hits` tables.
- Resend alert emails are sent on limit hits; missing keys skips alerts.
