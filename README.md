# AI System Designer

Technical summary of a web app that supports AI-assisted system design with project workspaces, chat, and generated assets.

## Scope
- Next.js app with a Supabase/Postgres backend
- AI chat with streaming responses
- Project-scoped assets (markdown, mermaid)

## Features
- Project workspaces with chat, asset list, and asset viewer
- Mermaid diagram rendering and Markdown rendering
- RAG-style context: project assets included in AI prompts
- Per-user and global daily rate limits
- Input token caps and output token caps
- Alert emails on rate limit hits (Resend)

## Skills Demonstrated
- Next.js App Router, streaming SSE
- Supabase auth + Postgres schema design
- LangChain prompt orchestration
- RAG context assembly
- Rate limiting and alerting workflows
- Markdown/Mermaid rendering pipelines

## Tech Stack
- Next.js 15, React 19, TypeScript, Tailwind
- Supabase (Postgres, Auth)
- LangChain + OpenAI
- Mermaid, React Markdown
- Cypress E2E

## Repo Structure
```
SystemsDesignerAI/
  system-designer-ai/      # main app
  _design_assets/          # design docs
  _design_assets_meta/     # implementation notes
  implementation-tracker/  # tracking docs
```

## Setup
See `system-designer-ai/README.md` for local setup and scripts.

## Development
Developer-focused docs live in `system-designer-ai/README.md`.
