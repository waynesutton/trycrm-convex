# Files

Brief description of what each file does. Updated 2026-08-09 19:55 UTC.

## Root

| File | Description |
| --- | --- |
| `package.json` | Single npm package: scripts for dev, build, typecheck, deploy, seed |
| `vite.config.ts` | Vite with React and Tailwind 4 plugins |
| `tsconfig.json` | Project references to the app and convex tsconfigs |
| `tsconfig.app.json` | Frontend TypeScript config, strict mode |
| `index.html` | Vite entry HTML with meta tags, the pre-paint theme script, and the Rybbit analytics tag |
| `README.md` | Project overview, quick start, configuration, deploy guide |
| `CHANGELOG.md` | Convex port entries (2.0.0 through 2.4.0) on top of the upstream history |
| `task.md` | Work tracking for this port |
| `files.md` | This file |
| `eslint.config.js` | ESLint 9 flat config with the Convex plugin and type aware typescript-eslint |

## convex/ (backend)

| File | Description |
| --- | --- |
| `convex.config.ts` | Installs all components; declares the required `CONTEXT_DEV_API_KEY`, `FIRECRAWL_API_KEY`, and `EXA_API_KEY` env vars |
| `schema.ts` | All tables: workspace (with email/AI provider, sidebar prefs, and Slack settings), users, companies, contacts, deals, activities, custom fields, agent tasks, agent definitions and versions, runs, facts, chat threads, ask threads, log events, slackIdentities |
| `http.ts` | App-owned root routing; AgentMail webhook at /agentmail/webhook; signed Slack bot routes under /webhooks/slack/; static hosting registered as the catch-all |
| `staticHosting.ts` | Exposes the deployment query for live reload on deploy |
| `crons.ts` | Demo reset every 10 minutes, agent queue tick every minute |
| `aggregates.ts` | Deal rollups by stage (namespaces must stay a small fixed set), with insert/replace/delete tracking helpers |
| `demo.ts` | Reset (a no-op when demo mode is off), first-boot seed, demo info for the banner, manual reset request, and `disableDemoMode` for forks |
| `companies.ts` | Company list, detail, create (queues enrichment), update, delete, re-enrich, names picker |
| `contacts.ts` | Contact list, detail with facts, create, update, delete |
| `deals.ts` | Board grouped by stage, create, update, stage change with activity log, delete |
| `activities.ts` | Timelines per record, open tasks, note and task creation with optional email reminders, task completion |
| `fields.ts` | Custom field definitions and values, agent briefs, rename and option edits, archive and restore, batch `tableValues` query for table columns |
| `tableSettings.ts` | Per-entity column preferences (rename, hide, pin) and new-record defaults (owner, industry, stage, currency, auto enrich); `entityDefaults` helper for create mutations |
| `dashboard.ts` | Pipeline summary from aggregates, recent activity feed |
| `agentTasks.ts` | The work queue: claim with leases, tick, execute through the workpool, rechecks with required reasons |
| `agents.ts` | Agent builder: draft from a sentence, versioned instructions, deploy and pause |
| `enrichment.ts` | Context.dev brand lookup with action cache and rate limiter, writes facts and timeline entries |
| `chat.ts` | Record chat on the agent component, with read_crm_history, search_the_web (Exa), and read_web_page (Firecrawl) tools; runs on the workspace's selected AI provider |
| `ask.ts` | Workspace-wide Ask chat: threads with archive and delete, CRM overview tool, web research tools, streamed provider-aware generation, /task and /note slash commands with relative and explicit due date parsing |
| `ai.ts` | AI provider registry: DeepSeek (default), OpenAI, Anthropic, OpenRouter, and Grok models, key checks, and the missing-key reply |
| `prefs.ts` | Workspace preferences: sidebar order and hidden items, AI provider |
| `logs.ts` | Activity log: record helper for mutations and actions, list query, clear and clearMany mutations |
| `search.ts` | Command-K global search on full text `search_name` indexes with a bounded scan fallback for domains and emails |
| `email.ts` | Resend and AgentMail wrappers, provider query and toggle, compose defaults (from identity, signature), the compose mutation with timeline logging and attachment upload URLs, and the sendComposed delivery action; logs a no-op when no key is configured |
| `web.ts` | Web scrape (Firecrawl or Context.dev) and web search (Exa or Context.dev) internal actions; any one key enables its tool, and a failed primary call falls back to the other configured provider |
| `capabilities.ts` | Query reporting which integrations have real keys (including Slack webhook, bot token, and signing secret), shown in Settings |
| `slack.ts` | Outbound Slack notifications: notifySlack helper with per-event toggles, webhook and bot token delivery through the action retrier, message capping, deep links, test action, channel list action, and the Settings query and mutation |
| `slackBot.ts` | The /crm slash command bot: v0 request signing verification, three HTTP routes, Slack user to member identity matching, and find, deal, note, task, activity commands that reuse the model helpers |
| `users.ts` | Team member list for pickers and avatars |
| `model/access.ts` | Write access checks; demo mode keeps writes open |
| `model/activities.ts` | Shared timeline write used by activities.create and the Ask slash commands: inserts the row, logs the event, schedules the email reminder |
| `model/functions.ts` | `writeMutation` custom mutation from convex-helpers; runs the access check before every write |
| `model/deals.ts` | Shared deal stage-change write used by the UI mutation and the Slack bot: patch, aggregates, timeline, log, Slack notification |
| `model/cascade.ts` | Manual cascading deletes for companies, contacts, deals |
| `model/seed.ts` | Demo seed content: workspace, team, companies, contacts, deals, activities, agents |

## src/ (frontend)

| File | Description |
| --- | --- |
| `main.tsx` | Convex client and router setup; derives the backend URL when served from convex.site |
| `App.tsx` | Routes: landing, compare, docs, and the /app CRM shell (dashboard, companies, contacts, deals, ask, activity, agents, settings) |
| `index.css` | Theme tokens for Composio dark (default) and Minimax light (`html.light`) |
| `vite-env.d.ts` | Vite client types |
| `lib/format.ts` | Money, relative time, short dates, stage labels, initials |
| `lib/columns.ts` | Column registry for the three entity tables: built-in column definitions, custom field column keys, merge of saved preferences with active fields |
| `components/dataTable.tsx` | Shared table infrastructure: `useEntityTable` and `useStickyColumns` hooks, portal header menu (sort, pin, hide, reset), Columns chooser dropdown, click-to-edit custom field cell |
| `components/ui.tsx` | Panel, buttons, inputs, themed Select and NumberInput and DateInput calendar, custom-drawn accent Checkbox with animated checkmark, shared TextLink with underline and hover variants, avatars, badges, empty states |
| `components/Timeline.tsx` | Shared notes-and-tasks composer and feed for company and contact detail, with due dates in days or from a calendar, reminders, and complete buttons |
| `components/ComposeEmail.tsx` | Floating compose window: draggable, resizable, To/Cc/Bcc/Subject, markdown body with preview, Convex storage attachments, provider-aware Send |
| `components/ShortcutsModal.tsx` | Themed keyboard shortcuts modal, opened from the sidebar footer icon or ⌘? |
| `components/DemoBanner.tsx` | Demo banner with live countdown to the next reset |
| `components/ThemeToggle.tsx` | Light and dark mode switch backed by localStorage |
| `components/CommandK.tsx` | Command-K search palette with keyboard navigation |
| `app/AppLayout.tsx` | Sidebar shell: demo badge, search trigger, drag-reorderable and hideable nav, Phosphor collapse toggle, global ⌘K ⌘? ⌘. keys, fork and docs links, shortcuts and theme buttons; seeds the workspace on first visit |
| `app/Dashboard.tsx` | Stat cards, pipeline by stage, agent follow-ups, recent activity |
| `app/Companies.tsx` | Column-driven company table: search, enrichment filter, header menus with sort and pin, custom field columns with inline edit, inline add row, pagination, create form |
| `app/CompanyDetail.tsx` | Tabs: overview (with click-to-edit custom fields), contacts, deals, activity, and the agent tab with record chat |
| `app/Contacts.tsx` | Column-driven contact table: search, company filter, header menus, custom field columns with inline edit, inline add row, pagination |
| `app/ContactDetail.tsx` | Facts with evidence bands, recheck scheduling, notes-and-tasks timeline |
| `app/Deals.tsx` | Drag-and-drop board plus a column-driven list view with custom field columns, stage moves, and a create form prefilled from workspace defaults |
| `app/Ask.tsx` | Claude-style workspace chat: streamed replies, thread sub-sidebar with archive and delete, slash commands, time-aware greeting, provider notes |
| `app/Activity.tsx` | Live function-outcome log with pause, select one or all, and clear, in the shape of the Convex dashboard |
| `app/Agents.tsx` | Agent builder: describe a process, manage drafts, deploy, pause |
| `app/Settings.tsx` | Sub-sidebar settings pages under /app/settings/:section: Team, Companies, Contacts, Deals (per-entity defaults, columns, custom fields), Integrations (with the "Adding API keys" panel), Slack (master switch, event toggles, channel picker with search, test button, /crm bot), Email (provider toggle plus compose defaults), AI provider, Sidebar show/hide |
| `app/EntitySettingsSection.tsx` | The per-entity settings body: new-record defaults panel, column list with inline rename plus show and pin toggles, custom fields manager with type-specific creation, option editing, archive and restore |
| `pages/Landing.tsx` | Marketing page: hero with copy prompt and git clone one-liner, built-with, "What it actually does" bento with JSX mock UI blocks (agent builder with deployed agents, companies table, record chat, Slack message, web research tool calls, Ask slash commands, rechecks, activity log, BYOK key groups), demo video, demo notes as a bullet list with accent highlights and per-line docs links |
| `pages/Compare.tsx` | Upstream vs Convex comparison table |
| `pages/Docs.tsx` | Full setup and usage guide with a sticky sidebar, sidebar search over section titles and body text, and active-section highlight: fork, env vars, email and compose, email DNS with Cloudflare, Slack, web research, AI providers, auth, deploy, custom domain with Cloudflare, coding agents |

## public/

| File | Description |
| --- | --- |
| `convex-logo-white.png` | White Convex logo used in the Built with section, footer, and favicon (inverts in light mode) |
| `logos/react-white.svg` | White React mark for the Built with section |
| `logos/vite-white.svg` | White Vite mark for the Built with section |
| `og.png` | 1200x630 dark mode share image: "The CRM built for agents on Convex" hero with the full built-with logo wall |
| `demo.mp4` | 20 second HeyGen product demo video shown on the landing page |
| `demo-poster.png` | Poster frame for the landing page demo video |
| `landing/` | Avatars and company logos carried over from upstream for seed data |

## docs/

Upstream documentation and the port instructions in `docs/try-crm-instructions/`. PRDs: `prds/convex-port.md` (the port), `prds/components-docs-theme.md` (web research components, docs page, and themes), `prds/ask-tables-logs-polish.md` (Ask chat, activity log, Command-K, table upgrades), `prds/compose-email-settings-docs.md` (compose email, Settings sub-sidebar, docs sidebar), `prds/disable-demo-reset-for-forks.md` (fork-safe demo reset), `prds/mobile-pass.md` (mobile responsiveness pass), `prds/slack-integration.md` (Slack notifications and the /crm bot), `prds/task-due-date-calendar.md` (calendar due dates for tasks), `prds/landing-what-it-does-bento.md` (landing bento with mock UI blocks and BYOK), `prds/adopt-community-prs.md` (community PR adoption, TextLink, component version pass), and `prds/demo-reset-scheduled-function-limit.md` (demo reset scheduling limit fix, dealsByOwner removal).
