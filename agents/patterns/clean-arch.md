# Clean Architecture

Well-known industry pattern (not invented for this repo) — apply it on every
change without being asked.

This repo's Medusa layering **is** this project's concrete implementation of
Clean Architecture — don't restate it here, follow it at the source:

- Layer boundaries and dependency direction (route → workflow → module
  service → data): `agents/overview.md`, "Engineering principles" and
  "Architecture and flow"
- The Medusa-specific rules for extending each layer (never a raw DB client
  or SQL in a route, never fork a core workflow, every step's compensation
  is part of that step's own contract): `agents/backend.md`, "Patterns to
  follow when extending"

## The general principle, for when a new situation doesn't map cleanly onto
## an existing rule above

- Inner layers (domain/business logic) never depend on outer layers
  (HTTP, a specific vendor SDK, a UI framework). A workflow step should be
  fully testable without an HTTP request object or an Express-shaped
  req/res in scope.
- A dependency points inward: `API routes → workflows → module services →
  persistence`. If you find a module service reaching back out to read
  something from the HTTP layer, or a workflow importing an Express type,
  that's the boundary being crossed backwards — stop and route the data in
  as a plain input instead.
- The same rule applies to third-party services: nothing outside the
  integration's own adapter should know which vendor SDK it's calling
  (`agents/backend.md`, "Keep provider and host choices at the edges").
