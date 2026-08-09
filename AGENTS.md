# Strict rules — review before starting any work

## What this is

An agentic CRM on one Convex deployment. Convex is the database, the agent
runtime, the work queue, the file store, the cron scheduler, and the web host.
There is no Postgres, no Redis, no separate API server, no Vercel, no monorepo.

`convex/` is the backend, `src/` is the frontend, npm is the package manager.

## Read the doc for the area you are touching before you touch it

These are plain paths, not imports: they are not in your context until you read
them, and the rules in them are not optional.

| Working on | Read first |
| --- | --- |
| Anything in `convex/` | `convex/_generated/ai/guidelines.md` |
| Which components are installed, and why each one is there | `convex/convex.config.ts` |
| What a given file does | `files.md` |
| Setup, keys, deploying, demo mode | `README.md` |
| The spec a feature was built from | `prds/` |
| A design decision and what it ruled out | `adrs/` |
| Versions, changelog, how a change reaches `release` | `CONTRIBUTING.md` |
| Why something works the way it does, for porting context only | `docs/upstream/` |

`docs/upstream/` documents the pre-Convex stack this port deleted: tRPC, Nest,
Prisma, Better Auth, eve, `apps/api`, `packages/ui`. Read it to understand
intent. Never read it to decide how to build something here — none of those
paths exist in this repo.

Also check `.agents/skills/` before starting. The `convex-*` skills there cover
auth, crons, env vars, seeding, testing, migrations, authz, and deploys. Tell
the user which rules and skills you read.

## Always true

- **No coauthoring commits.** No `Co-Authored-By` trailer, ever.
- **Intelligence never lives in the query layer.** Convex functions report that
  something happened; the agent decides what it means. Two copies of an identity
  matcher drift, and one ends up matching every employer on earth.
- **There are no organizations.** Single tenant, on purpose — `workspace` is one
  row. An `organizationId` that is always the same value is a column, an index,
  and a permission check that buys nothing and reads like a real one at review
  time.
- **No tool accepts a confidence score.** Tools report what they observed. The
  evidence ledger (`evidenceBand` in `convex/schema.ts`) prices the observation.
  A model asked to grade its own certainty will do it, and it will be wrong in
  the direction that makes it look useful. A confidently wrong fact about a
  customer is worse than a blank field, because nobody can tell it is wrong.
- **Dispatch schedules, it never decides.** The one-minute `agent tick` cron
  leases what is due and starts a run per row. Anything shaped like "every N
  minutes, the oldest ten contacts" belongs in a task's `dueAt`, not in a cron
  expression.
- **Agent tools call internal functions only.** A tool that can reach a public
  mutation is a tool that can be reached from a browser console.
- **Money is integer minor units.** `amountMinor` plus `currency`. Round once,
  at the conversion boundary. Never store a fractional amount.
- **Anything a self-hoster might not have is optional and must never throw.** A
  missing key removes a capability and says so. `convex/capabilities.ts` is the
  pattern: the literal string `unset` counts as absent, and the settings screen
  renders a not-configured badge instead of the app failing.
- **`src/components/` is the source of shared UI.** A new variant is implemented
  there, not overridden at the call site.

## Environment variables

There is no `.env` file. Every variable is a Convex deployment variable, set
with `npx convex env set NAME value`, and dev and production are separate — set
each one twice if you have deployed. Document every new variable in the
`README.md` configuration table.

Three keys are declared required in `convex/convex.config.ts` because their
components declare them required; a deploy fails with
`MissingEnvironmentVariables` until they are set. `unset` is the documented
sentinel for running keyless.

## Demo mode

`convex/crons.ts` registers `demo reset`, which wipes and reseeds every table
every ten minutes, because this repo powers a public demo. Never assume data in
a dev deployment survives. Never add a feature that stores something a reset
would destroy without saying so in the PR.

`demoMode` on the `workspace` row gates it. While it is on, writes are open and
sign-in is off. Forks turn it off with `npx convex run demo:disableDemoMode` and
delete the `demo reset` cron line, keeping `agent tick`.

## Convex conventions

- `convex/model/<thing>.ts` holds logic that takes a `ctx`. No validators there.
- `convex/<thing>.ts` holds the `query` / `mutation` / `action` wrappers, with
  args validators, calling into `model/`.
- Every write goes through `writeMutation` from `convex/model/functions.ts`,
  which runs the access check before the handler. That is the Convex pattern for
  row level security, and `convex/model/access.ts` is the one file that changes
  when real auth is wired.
- Read through an index. Every filter has one; if it does not, add it to
  `schema.ts` rather than filtering in memory. The Convex ESLint plugin warns on
  `.filter()` in queries, and the repo currently has none.
- `.collect()` is for reads already bounded by an index — the contacts of one
  company, the deals of one record. List views paginate with `paginationOpts`.
  A handful of full-table `.collect()` calls survive at demo scale
  (`convex/dashboard.ts`, `convex/users.ts`, `convex/agents.ts`); treat those as
  a debt to pay with aggregates or pagination, not as a precedent to copy.
- Timestamps are epoch millis. `_creationTime` covers `createdAt`.
- Foreign keys are `v.id("table")`. `db.get`, `db.patch`, `db.replace`, and
  `db.delete` take an explicit table name — the ESLint plugin enforces it.
- `v.any()` only where the column is genuinely free-form JSON.
- Uniqueness is checked in the mutation, by index, before the write. Convex has
  no unique constraint.
- Cascades are hand written in `convex/model/cascade.ts` and are idempotent.
- Anything that calls an external service is an action, wrapped in
  `@convex-dev/action-retrier`, and cached with `@convex-dev/action-cache` when
  the same lookup repeats.
- Cron jobs stay off the top of the hour. The ESLint plugin checks this too.

## Two things that do not exist here

**No sandbox.** Upstream gave the model a shell with deny-all egress. Convex
actions have no shell. Tools that assumed a `/workspace` filesystem read and
write Convex documents instead. Do not simulate a shell with an eval loop.

**No runtime SSO registration.** Auth providers are code, set at deploy time.
A settings page may list what is configured; do not build a form that looks like
it registers a provider.

## Not built yet

These constraints bind whoever builds the feature. Nothing below exists in the
repo today — do not write code that reads from it or documentation that claims
it works.

**Auth.** `@convex-dev/auth` is not installed and there is no `convex/auth.ts`.
Today `requireWriteAccess` in `convex/model/access.ts` returns early in demo
mode and otherwise checks `ctx.auth.getUserIdentity()` for a non-null identity,
nothing more. When it is built: Convex Auth, not Better Auth, never Better Auth.
Providers live in `convex/auth.ts` and are read at deploy time. The sign-in
allow list is `workspace.allowedSignIn`, already in the schema and read by
nothing — enforce it in `callbacks.beforeSessionCreation`. Empty means nobody
signs in, which is the safe direction to fail. Convex Auth does not persist
OAuth access or refresh tokens, so mailbox access needs its own connection flow;
do not plan to read a Gmail token out of `authAccounts`, it is not there.

**Mailbox sync.** There is no `mailboxConnections` table and no mail sync. The
`mailboxPool` workpool is reserved for it. The plan is `docs/plan/gmail-calendar-plan.md`.
When it is built it is read-only and forward-only: the CRM lists and reads, and
never sends, replies, moves, or deletes on a connected mailbox. The first sync
records the current time and imports nothing. This is separate from outbound
notification email through Resend or AgentMail, which does exist and does send.

## Before you commit

- `npx convex dev --once` is clean.
- `npm run check-types` passes.
- `npm run lint` passes.
- There is no test suite yet. If you add one, add the script and update this
  list in the same PR.
- The diff does not add: `prisma`, `nestjs`, `trpc`, `better-auth`, `eve`,
  `@vercel/*`, `DATABASE_URL`, `REDIS_URL`, `AGENT_BRIDGE_SECRET`,
  `organizationId`, a per-package `.env`, or a `confidence` parameter on a tool.

## When to stop and ask

- A component's API does not match what the PRD in `prds/` assumes.
- An upstream behaviour cannot be reproduced on Convex.
- A change would alter what the agent is allowed to write to a customer record.

Guessing on any of those three is more expensive than the question.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
