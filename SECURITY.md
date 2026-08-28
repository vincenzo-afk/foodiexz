# Security Policy

## Scope

The primary supported application is the Next.js runtime under `app/` with API route handlers under `app/api/`. The `server/` directory contains a separate legacy Express/SQLite runtime and is not automatically synchronized with the Next.js data layer.

## Current security controls

The application currently includes JWT authentication, bcrypt password hashing, role guards, ownership checks, Zod request validation, server-side checkout total recalculation, coupon reconciliation, idempotency-key handling, and a secret-protected scheduled-order job route. These controls are not a substitute for production rate limiting, durable storage, security headers, or a reviewed payment integration.

## Supported versions

This repository is under active development. Security fixes are applied to the current `main` branch. Older commits and deployments are not guaranteed to receive fixes.

## Reporting a vulnerability

Please report suspected vulnerabilities privately through the repository owner’s [GitHub security page](https://github.com/vincenzo-afk/foodiexz/security), if private vulnerability reporting is enabled, or by contacting the maintainer through the [vincenzo-afk GitHub profile](https://github.com/vincenzo-afk).

Do not include exploitable details in a public issue. When reporting, provide the affected commit or deployment, reproduction steps, impact, and any suggested mitigation that can be shared safely.

## Secret handling

Never commit `.env`, `.env.local`, API keys, JWT secrets, cron secrets, production tokens, local databases, or customer data. Set a high-entropy `JWT_SECRET` in every non-development deployment and protect `CRON_SECRET` when scheduled-order processing is enabled.
