# Contributing to foodiexz

Thank you for contributing to foodiexz. Keep changes focused, preserve the existing Next.js and App Router conventions, and verify behavior locally before opening a pull request.

## Development setup

```bash
git clone https://github.com/vincenzo-afk/foodiexz.git
cd foodiexz
pnpm install --frozen-lockfile
pnpm dev
```

The root application uses Next.js route handlers under `app/api/`, a client shell in `App.tsx`, the Zustand store in `store/useStore.ts`, and a process-local data layer in `lib/db.ts`. The `server/` directory is a separate Express/SQLite runtime and should not be modified as though it shared state with the Next.js application.

## Before opening a pull request

Run the same quality checks used by continuous integration:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

For UI changes, include a short description of the affected flow and screenshots or a screen recording when useful. For API changes, document the route, request/response behavior, authentication requirements, validation changes, and any migration or deployment impact. Do not include real credentials, tokens, personal data, local databases, or generated build output in commits.

## Branches and commits

Create a focused branch from `main` using a descriptive name such as `feat/search-filters`, `fix/order-cancellation`, or `docs/readme`. Use concise imperative commit subjects with a conventional prefix, for example `feat: add scheduled order reminders`, `fix: reject stale checkout totals`, or `docs: clarify local setup`.

## Pull requests

A pull request should explain the intent, list the verification commands that passed, identify breaking changes, and call out security or data-model implications. Keep unrelated refactors separate so changes remain easy to review and revert.

## Reporting issues

Use the repository’s issue templates for reproducible bugs and feature requests. For security vulnerabilities, follow [`SECURITY.md`](SECURITY.md) instead of opening a public issue.
