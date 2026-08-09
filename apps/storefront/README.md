# Storefront (`@dtc/storefront`)

Next.js customer storefront for the Medusa chassis. Talks to the Medusa Store API with a publishable key.

## Tech stack

- **Next.js (App Router)**: UI and routing
- **Medusa JS SDK**: Store API client
- **Tailwind CSS**: starter styling (shadcn/ui planned in `docs/plan.md` Phase 1)

## Project structure

```text
src/
├── app/                 # App Router routes
├── lib/                 # SDK and helpers
└── modules/             # UI feature modules (starter layout)
```

## Requirements

- Node.js 20+
- Running Medusa backend (default http://localhost:9000)
- Publishable API key in `.env.local`

## Getting started

1. Install dependencies (from repo root):

```bash
pnpm install
```

2. Configure env:

```bash
cp .env.template .env.local
```

Set `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` from Medusa Admin.

3. Run this package:

```bash
pnpm run dev
```

Storefront: http://localhost:8000
