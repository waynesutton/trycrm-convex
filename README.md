<h1 align="center">The Open Source Agent CRM on Convex</h1>

<p align="center">
  <strong>The open source agentic CRM, ported to run entirely on Convex.</strong><br>
  One deployment is the database, the agent runtime, the work queue, the cron scheduler, the file store, and the web host.
</p>

<p align="center">
  <a href="https://convex.link/crmonconvex"><strong>Live demo</strong></a> ·
  <a href="#quick-start"><strong>Quick start</strong></a> ·
  <a href="#configuration"><strong>Configuration</strong></a> ·
  <a href="#email-two-providers"><strong>Email</strong></a> ·
  <a href="#deploying-to-convex-cloud"><strong>Deploying</strong></a> ·
  <a href="#turning-off-the-demo-reset"><strong>Forking</strong></a> ·
  <a href="#how-it-compares-to-upstream"><strong>Compare</strong></a>
</p>

## What this is

This is a port of [trycompai/crm](https://github.com/trycompai/crm) that replaces the entire infrastructure with a single [Convex](https://convex.dev) deployment. The product carried over intact: durable research agents that enrich companies and contacts, an evidence ledger where nothing about a person is guessed, rechecks that require a stated reason, agents that build agents, and record chat that reads your own history and shows its working.

What changed is everything underneath. No Vercel, no Postgres, no Prisma, no Redis, no separate API server, no Better Auth. The frontend is a Vite React app served by the Convex static hosting component from the same deployment that runs the backend.

Try it at [convex.link/crmonconvex](https://convex.link/crmonconvex) (served from [good-dog-8.convex.site](https://good-dog-8.convex.site/)). The demo runs in demo mode: everything works in real time, content resets every 10 minutes with a Convex cron job, and auth and email are intentionally not configured. The site has a full setup and usage guide at `/docs`, written for people who have never deployed a backend.

## The stack

| Layer            | Technology                                                                                                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend          | Convex functions, TypeScript end to end                                                                                                                                             |
| Database         | Convex database with typed schema and indexes                                                                                                                                       |
| Frontend         | React 19, Vite, React Router, Tailwind CSS 4 (dark and light themes)                                                                                                                |
| Hosting          | [`@convex-dev/static-hosting`](https://www.convex.dev/components/static-hosting) serving the built app                                                                              |
| Agent runtime    | [`@convex-dev/agent`](https://www.convex.dev/components/agent) with tools, threads, and message history                                                                             |
| Work queues      | [`@convex-dev/workpool`](https://www.convex.dev/components/workpool), three pools so slow work cannot starve the dispatcher                                                         |
| Brand enrichment | [`@context-dot-dev/convex`](https://www.convex.dev/components/context-dot-dev/convex), the same Context.dev data the upstream uses; the same key also backs web search and scraping |
| Web scraping     | [`@firecrawl/firecrawl-convex`](https://www.convex.dev/components/firecrawl/firecrawl-convex) or Context.dev, the chat agent reads pages as markdown with either key                |
| Web search       | [`@exalabs/convex-exa`](https://www.convex.dev/components/exalabs/convex-exa) or Context.dev, search as an agent tool with either key                                               |
| AI providers     | DeepSeek, OpenAI, Claude (Anthropic), OpenRouter, or xAI Grok via the AI SDK, switchable in Settings, no key ships by default                                                       |
| Email            | [`@convex-dev/resend`](https://www.convex.dev/components/resend) or [`@agentmail/convex`](https://www.convex.dev/components/agentmail/convex), switchable in Settings               |
| Caching          | [`@convex-dev/action-cache`](https://www.convex.dev/components/action-cache), 7 day TTL on brand lookups, replaces Redis                                                            |
| Rate limiting    | [`@convex-dev/rate-limiter`](https://www.convex.dev/components/rate-limiter) on the enrichment budget                                                                               |
| Rollups          | [`@convex-dev/aggregate`](https://www.convex.dev/components/aggregate) for pipeline value by stage and owner                                                                        |
| Scheduling       | Convex cron jobs plus [`@convex-dev/crons`](https://www.convex.dev/components/crons)                                                                                                |
| Durability       | [`@convex-dev/workflow`](https://www.convex.dev/components/workflow) and [`@convex-dev/action-retrier`](https://www.convex.dev/components/retrier)                                  |
| Migrations       | [`@convex-dev/migrations`](https://www.convex.dev/components/migrations)                                                                                                            |

Package manager is npm. There is no monorepo; `convex/` is the backend, `src/` is the frontend.

## Quick start

```bash
git clone https://github.com/waynesutton/trycrm-convex.git
cd trycrm-convex
npm install
npx convex dev
```

The first `npx convex dev` walks you through creating a free Convex project. It will ask for three required environment variables before the first push:

```bash
npx convex env set CONTEXT_DEV_API_KEY unset
npx convex env set FIRECRAWL_API_KEY unset
npx convex env set EXA_API_KEY unset
```

The literal string `unset` is the documented sentinel for running without vendor keys. Each feature reports that it is not configured instead of failing. Put real keys there whenever you have them; the features switch on immediately, no redeploy needed.

Then, in a second terminal:

```bash
npm run dev:frontend
```

Open the printed localhost URL. The app seeds itself with demo data on first visit. Or run both together:

```bash
npm run dev
```

Prefer letting a coding agent do this? The landing page has a "Copy the setup prompt" button that hands the exact instructions to Cursor, Codex, Claude Code, or whatever you use.

## Configuration

Every outside key is optional in practice. The app degrades honestly: features that need a key say so instead of pretending.

| Variable                                   | What it enables                                                                                                                              | Without it                                                                             |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `CONTEXT_DEV_API_KEY`                      | Company enrichment from Context.dev brand data, plus web search and page reading for the chat agent when the Exa or Firecrawl key is missing | Enrichment tasks complete with a "not configured" note. Set to `unset` to run keyless. |
| `FIRECRAWL_API_KEY`                        | Chat agent reads web pages via Firecrawl. Context.dev covers this when only its key is set                                                   | The tool tells the agent which keys enable it. Set to `unset` to run keyless.          |
| `EXA_API_KEY`                              | Chat agent searches the web via Exa. Context.dev covers this when only its key is set                                                        | Same honest degradation. Set to `unset` to run keyless.                                |
| `DEEPSEEK_API_KEY`                         | Chat and agent reasoning on DeepSeek when it is the selected provider (the default). Optional `DEEPSEEK_API_BASE_URL` and `DEEPSEEK_MODEL`   | Chat replies name the missing key                                                      |
| `OPENAI_API_KEY`                           | Chat and agent reasoning when OpenAI is the selected provider                                                                                | Chat replies name the missing key                                                      |
| `ANTHROPIC_API_KEY`                        | Chat and agent reasoning when Claude is the selected provider                                                                                | Same                                                                                   |
| `OPENROUTER_API_KEY`                       | Chat and agent reasoning when OpenRouter is the selected provider                                                                            | Same                                                                                   |
| `GROK_API_KEY`                             | Chat and agent reasoning on Grok (xAI) when it is the selected provider. Optional `GROK_API_BASE_URL` and `GROK_MODEL`                       | Same                                                                                   |
| `RESEND_API_KEY`                           | Outbound email through the Resend component                                                                                                  | Email sends are logged as no-ops                                                       |
| `AGENTMAIL_API_KEY` + `AGENTMAIL_INBOX_ID` | Outbound email plus a persistent agent inbox through AgentMail                                                                               | Same, logged as no-ops                                                                 |
| `SLACK_WEBHOOK_URL`                        | Slack notifications in simple mode: posts to one fixed channel through an incoming webhook                                                   | Slack sends are logged as no-ops                                                       |
| `SLACK_BOT_TOKEN`                          | Slack notifications in full mode: the channel picker in Settings and the `/crm` bot                                                          | Same, logged as no-ops                                                                 |
| `SLACK_SIGNING_SECRET`                     | Verifies inbound Slack slash commands for the `/crm` bot                                                                                     | Bot routes answer 503; notifications unaffected                                        |
| `APP_URL`                                  | Overrides the base URL in Slack deep links, for custom domains                                                                               | Links use the `.convex.site` URL                                                       |
| `FIRECRAWL_WEBHOOK_SECRET`                 | Verifies Firecrawl crawl webhooks                                                                                                            | Optional; only needed for webhook-mode crawls                                          |
| `AGENTMAIL_WEBHOOK_SECRET`                 | Verifies inbound AgentMail webhooks                                                                                                          | Optional; unverified deliveries are rejected                                           |

Set any of them with:

```bash
npx convex env set OPENAI_API_KEY sk-...
```

None of the five AI keys ship by default. A fresh fork has no model keys at all; the Ask page and record chat answer with the exact key they need instead of erroring. Pick which provider the chat uses in Settings. DeepSeek is the default.

Demo mode is a flag on the workspace row, set by the seed. While it is on, writes are open, sign-in is disabled, and the reset cron wipes and reseeds all tables every 10 minutes. The banner in the app counts down to the next reset. Forking this for real use? Turn it off first: see [Turning off the demo reset](#turning-off-the-demo-reset).

## Email: two providers

Notifications route through one of two components, and Settings has a toggle to pick which:

- **Resend** is plain outbound email. One key: `RESEND_API_KEY`.
- **AgentMail** sends too, and also gives agents a persistent inbox: threads, labels, and delivery status sync into Convex tables reactively. Two values: `AGENTMAIL_API_KEY` and `AGENTMAIL_INBOX_ID`. For inbound mail, register `https://YOUR-DEPLOYMENT.convex.site/agentmail/webhook` in the AgentMail dashboard and set `AGENTMAIL_WEBHOOK_SECRET`.

Both can hold keys at the same time; the toggle decides which one sends. With neither configured, sends are logged instead of failing, which is how the public demo runs.

## Slack: notifications and the /crm bot

> **Untested.** Built against Slack's current API docs but not yet run against a live Slack workspace. The Activity page logs every send, skip, and failure; start there if something misbehaves, and open an issue if you hit a bug.

Off by default. Turn it on in Settings, Slack, then connect one of two modes. Dev and production keep separate env vars, so run each `npx convex env set` command twice if you deployed: once for dev, once with `--prod`.

- **Webhook mode** posts CRM events to one fixed channel. Create a Slack app at [api.slack.com/apps](https://api.slack.com/apps), enable [Incoming Webhooks](https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks/), pick a channel, and set `SLACK_WEBHOOK_URL`. Two minutes, no scopes.
- **Bot mode** lets you search and pick the channel from Settings and enables the `/crm` slash command. Add the `chat:write`, `channels:read`, `users:read`, and `users:read.email` [bot scopes](https://docs.slack.dev/reference/scopes) (plus `groups:read` for private channels), install the app, and set `SLACK_BOT_TOKEN`. Invite the bot to the channel with `/invite @your-bot-name`.

What posts, each behind its own toggle: new companies and contacts, new deals and stage changes, task completions, and agent run summaries. Every message includes an Open in CRM link. Deliveries retry with backoff through the [action retrier component](https://www.convex.dev/components/retrier); demo mode never posts, and every send or skip shows on the Activity page.

The `/crm` bot needs two more things: `SLACK_SIGNING_SECRET` (from your Slack app's Basic Information page) and a [slash command](https://docs.slack.dev/interactivity/implementing-slash-commands/) pointed at `https://YOUR-DEPLOYMENT.convex.site/webhooks/slack/commands`. Then flip the bot switch in Settings, Slack. Commands: `/crm find`, `/crm deal <name> <stage>`, `/crm note`, `/crm task`, `/crm activity`, `/crm help`. Every request is verified with Slack's [signed secrets scheme](https://docs.slack.dev/authentication/verifying-requests-from-slack/), and only workspace members (matched by Slack profile email against the Team list, or an allowed domain) can act. The full walkthrough lives on the `/docs` page of your deployment.

## Linting and helpers

The repo uses the [Convex ESLint plugin](https://docs.convex.dev/eslint) with type aware linting. It enforces argument validators, explicit table names in `db.get`, `db.patch`, `db.replace`, and `db.delete`, warns on `.filter()` in queries, and keeps cron jobs off the top of the hour.

```bash
npm run lint
```

Write access runs through one wrapper built on [`convex-helpers`](https://github.com/get-convex/convex-helpers): `writeMutation` in `convex/model/functions.ts` calls the access check before every mutation handler. That is the Convex pattern for row level security. When you wire real auth, `convex/model/access.ts` is the only file that changes.

## Deploying to Convex cloud

One deployment serves the backend and the site. Before the first production deploy, set the required env vars on production. They are separate from dev, so the values you set during setup do not carry over, and the push fails with `MissingEnvironmentVariables` without them:

```bash
npx convex env set CONTEXT_DEV_API_KEY unset --prod
npx convex env set FIRECRAWL_API_KEY unset --prod
npx convex env set EXA_API_KEY unset --prod
```

Then, from a configured project:

```bash
npm run deploy
```

That runs `npx @convex-dev/static-hosting deploy`, which does the whole thing in one shot: builds the frontend with the production Convex URL, deploys the Convex backend, and uploads the built files to Convex storage.

Your site is then live at your deployment's `.convex.site` URL, which the Convex dashboard shows under Settings. The static hosting component handles SPA routing, hashed asset caching, and garbage collection of old builds. Deploys are atomic; clients subscribed through the deployment query can offer a refresh when a new build ships.

To seed production data once:

```bash
npx convex run demo:seedPublic --prod
```

## Turning off the demo reset

`convex/crons.ts` registers a `demo reset` cron that wipes and reseeds every table every 10 minutes, because this repo powers a public demo. If you fork this to use as a real CRM, turn it off before you enter real data.

One command flips the workspace out of demo mode:

```bash
npx convex run demo:disableDemoMode         # dev deployment
npx convex run demo:disableDemoMode --prod  # production, if you deployed
```

Once demo mode is off, two things change. The reset handler becomes a no-op, so even if the cron still fires it wipes nothing and logs a skip to the Activity page. And writes start requiring a signed-in user, so wire up auth next (the `/docs` page on your deployment has a section on it).

The cron itself still fires every 10 minutes until you remove it, so delete the `demo reset` line from `convex/crons.ts` too. Keep the `agent tick` line; that one drives the agent task queue.

Prefer to hand the whole cleanup to a coding agent? Paste this into Cursor, Codex, Claude Code, or whatever you use:

```text
I forked waynesutton/trycrm-convex and I am using it as a real CRM, not a public demo. Make sure my data is never wiped: run npx convex run demo:disableDemoMode on my dev deployment, and if I have a production deployment run it again with --prod. Then delete the demo reset cron line from convex/crons.ts and push. Leave the agent tick cron in place. Finish by confirming the workspace row has demoMode set to false.
```

## What works in the demo

- Companies, contacts, deals board, dashboard rollups, custom fields, timelines, all real time
- Notes and tasks on every company and contact: due dates, email reminders through the selected provider, complete buttons, all mirrored to the Activity page
- Compose email from any company or contact: a draggable, resizable window with To, Cc, Bcc, markdown preview, and attachments; the timeline records every send, and delivery waits for a Resend or AgentMail key
- Settings split into pages with a sub-sidebar: Team, Integrations, Slack, Email (provider, from identity, signature), AI provider, Sidebar, Custom fields
- Slack integration, off by default: event notifications with per-event toggles, a channel picker with search, a test button, and a `/crm` slash command bot
- Table sorting, filtering, and inline add rows on Companies and Contacts
- Deals as a drag and drop board plus a sortable list view
- Ask: a Claude-style workspace chat with streamed replies, slash commands (including `/task` and `/note`, which need no AI key), a thread sub-sidebar, archive, and delete
- Command-K search backed by Convex full text search indexes on companies, contacts, and deals
- Activity: a live dashboard-style log of function outcomes with pause, select one or all, and clear
- Sidebar items reorder by drag and drop; Settings can hide items; the rail icon collapses the sidebar
- Agent task queue with leasing, workpools, and scheduled rechecks that require a reason
- Agents that build agents: describe a process, get a versioned draft definition
- Record chat with web research tools (Firecrawl, Exa, or Context.dev, any one key is enough) that answer honestly about missing keys
- AI provider picker: DeepSeek (default), OpenAI, Claude, OpenRouter, or Grok, none configured by default
- Dark and light themes with a toggle in the header and the sidebar footer
- Demo reset every 10 minutes via cron (the Activity log resets with it)

What is intentionally off in the demo: sign-in (the code is structured for Convex Auth; the demo keeps writes open on seeded data), outbound email (Resend and AgentMail are installed but no keys are set), and Slack (built in, but the demo never posts).

## How it compares to upstream

The app has a live comparison page at `/compare` and full setup docs at `/docs`. Short version:

| Area            | trycompai/crm                           | This version                                                                                      |
| --------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Hosting         | Vercel plus a separate API              | Convex static hosting                                                                             |
| Database        | Postgres with Prisma                    | Convex database                                                                                   |
| Realtime        | Polling and invalidation                | Reactive queries                                                                                  |
| Queue           | Redis backed workers                    | Workpool components, queue as a table                                                             |
| Auth            | Better Auth                             | Convex Auth ready, off in demo                                                                    |
| Email           | Resend SDK calls                        | Resend or AgentMail components, switchable                                                        |
| Web research    | Not included                            | Firecrawl or Context.dev scraping and Exa or Context.dev search as agent tools; any one key works |
| AI providers    | OpenAI                                  | DeepSeek (default), OpenAI, Claude, OpenRouter, or Grok, switchable in Settings                   |
| Workspace chat  | Per-record chat only                    | Ask page with streamed replies, slash commands, and thread history                                |
| Notes and tasks | Notes on records                        | Notes and tasks with due dates, reminders, and completion                                         |
| Search          | Per-table inputs                        | Command-K palette on full text search indexes                                                     |
| Observability   | Server logs                             | Activity page streams function outcomes live                                                      |
| Services to run | Frontend, API, Postgres, Redis, workers | One Convex deployment                                                                             |
| Package manager | bun, Turborepo                          | npm, single package                                                                               |

## Project layout

```
convex/            Backend: schema, functions, components config, crons
convex/model/      Shared logic: access control, cascade deletes, seed data
src/app/           CRM screens: dashboard, companies, contacts, deals, ask, activity, agents, settings
src/pages/         Landing, compare, and docs pages
src/components/    Shared UI primitives, demo banner, theme toggle
public/            Static assets served with the app
docs/              Upstream docs and port instructions
```

`files.md` has a description of every file. `changelog.md` tracks changes.

## License and credits

MIT licensed, the same license as the upstream project. The product design, agent philosophy, and seed content come from [Comp AI's CRM](https://github.com/trycompai/crm). This port swaps the infrastructure for Convex and its [components](https://www.convex.dev/components).
