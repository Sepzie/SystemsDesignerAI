# AI System Designer

AI-assisted system design workspace with chat, project assets, and generated diagrams/docs.

## At a glance
- Purpose: help teams design systems with AI in a structured workspace
- Core flow: chat → generate assets → review in project context
- Artifacts: Markdown docs and Mermaid diagrams

## Key features
- Project workspaces with chat, asset list, and asset viewer
- Mermaid diagram rendering and Markdown rendering
- RAG-style context: project assets included in AI prompts
- Per-user and global daily rate limits
- Input token caps and output token caps
- Alert emails on rate limit hits (Resend)

## Skills demonstrated
- Next.js App Router, streaming SSE
- Supabase auth + Postgres schema design
- LangChain prompt orchestration
- RAG context assembly
- Rate limiting and alerting workflows
- Markdown/Mermaid rendering pipelines

## Tech stack
- Next.js 15, React 19, TypeScript, Tailwind
- Supabase (Postgres, Auth)
- LangChain + OpenAI
- Mermaid, React Markdown
- Cypress E2E

## Repo structure
```
SystemsDesignerAI/
  system-designer-ai/      # main app
  _design_assets/          # design docs
  _design_assets_meta/     # implementation notes
  implementation-tracker/  # tracking docs
```

## Getting started
1) Open `system-designer-ai/README.md` for local setup, scripts, and env vars.
2) Start with the main app in `system-designer-ai/`.

## Notes
Developer-focused docs live in `system-designer-ai/README.md`.
