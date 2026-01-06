## MVP Plan: SystemsDesignerAI

### Goal
Polish the existing app to be demo-ready without a redesign, add markdown rendering, make assets shared across conversations (RAG-style), add per-user + global daily rate limiting with real email alerts, and fix known API mismatches.

### Current State (confirmed by user)
- Auth works, chat works, Mermaid renders.
- Markdown displays but is not formatted.
- UI is hard to read and visually rough.
- Assets are not effectively shared across chat threads.

### Constraints
- Do not “nuke” the design; keep the structure and improve readability/usability.
- Add real email alerts for rate-limit hits.
- Skip asset versioning for now.

### Proposed Work Breakdown

#### 1) UI Polish (no redesign)
Scope: workspace pages, chat interface, asset viewer/list, and typography.
- Keep layout, but refine spacing, typography, color palette, and contrast.
- Add consistent card/background treatment and legible text hierarchy.
- Keep header + panels, but improve sizing and alignment.
- Ensure mobile responsiveness.

Key files to touch:
- `src/components/project-workspace/ProjectLayout.tsx`
- `src/components/project-workspace/chat/ChatInterface.tsx`
- `src/components/project-workspace/chat/MessageList.tsx`
- `src/components/project-workspace/chat/MessageItem.tsx`
- `src/components/project-workspace/asset/AssetViewer.tsx`
- `src/components/project-workspace/asset/AssetList.tsx`
- `src/app/page.tsx`
- `src/app/dashboard/page.tsx`

#### 2) Markdown Rendering
Replace raw `<pre>` with a Markdown renderer.
- Use a minimal, safe renderer (e.g., `react-markdown` + `remark-gfm`).
- Keep styling consistent with existing Tailwind theme.
- Add code block styling and inline code styles.

Key files:
- `src/components/project-workspace/asset/AssetViewer.tsx`
- Possibly add a `MarkdownRenderer` component in `src/components/common/`

#### 3) Shared Assets Across Conversations (RAG behavior)
Goal: assets created in any conversation show up in the project asset list and are discoverable.
- Ensure assets are stored by `project_id` and fetched by project scope.
- When AI response includes `[See asset: ...](semantic_id)` references, resolve against project assets, not conversation-specific state.
- Make sure asset fetcher can pull assets by semantic ID.

Key files:
- `src/lib/langchain/asset-extraction.ts`
- `src/lib/asset/asset-service.client.ts`
- `src/app/api/projects/[projectId]/assets/[assetId]/route.ts`
- `src/components/project-workspace/asset/AssetList.tsx`
- `src/contexts/AppContext.tsx`

#### 4) Rate Limiting + Alerts (per-user + global daily)
Implement hard caps and alert on limit hits.

Design:
- Add `rate_limits` table (per user, day) + `global_rate_limits` row (per day).
- Increment counters on AI message generation (stream endpoint).
- If a limit is exceeded: return an error to client, store a limit hit log, and trigger email alert.

Email Alerts:
- Use real email provider. Preferred: SendGrid (simple) or Resend (modern).
- Add env vars:
  - `ALERT_EMAIL_TO`
  - `ALERT_EMAIL_FROM`
  - `SENDGRID_API_KEY` or `RESEND_API_KEY`
- Log alert failures, but do not block the request.

Key files:
- `src/app/api/projects/[projectId]/conversations/[conversationId]/stream/route.ts`
- `src/lib/alerts/email.ts` (new)
- `supabase/migrations/*_create_rate_limits.sql` (new)
- `src/lib/rate-limit.ts` (new)

Suggested limits (confirm with owner):
- Per user: 50 AI responses / day
- Global: 500 AI responses / day

#### 5) Fix Known API Mismatches
Resolve edge cases that can break demo flows.
- Project API: `params.id` -> `params.projectId` in PUT/DELETE.
- Asset update API mismatch: client uses PATCH but server uses PUT (align).
- Missing mermaid validation endpoint or remove unused client call.

Key files:
- `src/app/api/projects/[projectId]/route.ts`
- `src/app/api/projects/[projectId]/assets/[assetId]/route.ts`
- `src/lib/api-client.ts`

### MVP Acceptance Checklist
- Login/register works, dashboard lists projects.
- New project launches workspace.
- Chat sends/streams responses.
- Mermaid diagram renders.
- Markdown renders with formatting.
- Assets list shows shared assets across conversations.
- Rate limits block overuse with clear error message and email alert.
- No 404s/500s on main flows.

### Notes for Next Agent
- There are design docs in `_design_assets` and `_design_assets_meta` if you want to align polish with existing docs.
- The system already uses Supabase and LangChain; keep changes minimal and aligned with current patterns.
