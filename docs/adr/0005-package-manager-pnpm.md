# ADR 0005: Package manager is pnpm

- Status: accepted
- Date: 2026-08-06
- Updated: 2026-08-09
- Deciders: engineering

## Context

The Medusa DTC monorepo is authored around pnpm workspaces (`packageManager` field, `pnpm-workspace.yaml`). npm works with flags but fights template defaults.

pnpm 11 requires explicit build approvals (`allowBuilds`) and can hang on supply-chain lockfile verification unless `trustLockfile` is set for a trusted starter lockfile.

## Decision

Use **pnpm** only. Root `packageManager` is authoritative. Never introduce a second lockfile.

Workspace settings live in `pnpm-workspace.yaml` (including `overrides`, `trustLockfile`, `allowBuilds`), not in the legacy `package.json#pnpm` field.

## Consequences

- All install/add/run commands use pnpm.
- After adding packages that need native postinstall, run `pnpm approve-builds` (or update `allowBuilds`) rather than disabling scripts globally.
