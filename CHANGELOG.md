# Changelog

## [2.13.15] (2026-08-12)

DeepSeek and Grok join the AI provider picker. Timestamp: 2026-08-12 18:18 UTC.

### Added

- DeepSeek is the default chat provider (`DEEPSEEK_API_KEY`, model `deepseek-v4-flash`) and Grok joins via `GROK_API_KEY` (`grok-4.5`). Both speak the OpenAI wire format, with optional `*_API_BASE_URL` and `*_MODEL` overrides. Settings, Ask, Docs, Compare, and the landing BYOK card list all five providers. No key ships by default; the chat names the missing key (`convex/ai.ts`, `src/app/Settings.tsx`)

## [2.13.14] (2026-08-11)

Demo reset no longer trips the 1000 scheduled function limit. Timestamp: 2026-08-11 19:57 UTC.

### Fixed

- The ten minute `demo:reset` cron threw "Too many functions scheduled by this mutation (limit: 1000)" inside `dealsByOwner.clearAll` and rolled back, so the demo stopped resetting. The aggregate was namespaced by owner user id, the reseed mints new ids every run, the component never deletes a namespace, and clearAll schedules one cleanup job per namespace, so after weeks the count crossed 1000 (`convex/demo.ts`)

### Removed

- The `dealsByOwner` aggregate had zero readers, so instead of paging its cleanup it is gone: unmounted from `convex/convex.config.ts`, dropped from the track helpers in `convex/aggregates.ts`, and out of the reset. `dealsByStage` stays because its namespaces are the six fixed stage strings; the comments in both files now state the bounded-namespace rule so this cannot regress

## [2.13.13] (2026-08-11)

Community PRs adopted: AGENTS.md rewritten for the Convex port, link hover states restored, plus a shared TextLink component. Timestamp: 2026-08-11 19:20 UTC.

### Changed

- AGENTS.md now describes this repo instead of the pre-port stack: the doc index points at real paths (convex/, files.md, prds/, adrs/, docs/upstream/), the Convex conventions section covers writeMutation, index-first reads, and the unset sentinel, the demo reset cron is called out up front, and Convex Auth and mailbox sync live in an honest "Not built yet" section. Contributed by Fagner Sales in PR 1 (`AGENTS.md`)
- Inline links across Docs, Settings, Landing, and ComposeEmail render through a new shared TextLink component with two treatments (always underlined for docs, hover underline for settings), so link classes cannot drift per call site (`src/components/ui.tsx`, `src/pages/Docs.tsx`, `src/app/Settings.tsx`, `src/pages/Landing.tsx`, `src/components/ComposeEmail.tsx`)
- `@convex-dev/workflow` bumped 0.4.4 to 0.4.5 after a version pass over every component in convex.config.ts; everything else is current (`package-lock.json`)

### Fixed

- Four Docs links copied the Ext class list and dropped the hover rule, so hovering changed nothing; nine Settings links drew their hover underline flush on the baseline through descenders. Both fixed by Fagner Sales in PR 2, and the upstream link on Compare gained the same 2px offset (`src/pages/Docs.tsx`, `src/app/Settings.tsx`, `src/pages/Compare.tsx`)
- The write access comment in `convex/model/access.ts` pointed at docs/deploy.md, which does not exist; it now points at the AGENTS.md "Not built yet" section

## [2.13.12] (2026-08-10)

Fork section copy goes package manager neutral. Timestamp: 2026-08-10 00:25 UTC.

### Changed

- The "Fork it. It's yours." blurb now reads "One clone, one Convex deployment, no other services to stand up" instead of naming npm, since forkers can use npm, bun, or pnpm and the point is zero extra infrastructure (`src/pages/Landing.tsx`)

## [2.13.11] (2026-08-09)

Demo team emails move to the real domain. Timestamp: 2026-08-09 23:49 UTC.

### Changed

- The three seeded team members (Patrick, Dan, Lewis) now use @realtimecrm.dev emails instead of @trycomp.ai (`convex/model/seed.ts`). The Comp AI company record and its contact Sam Whitfield keep the trycomp.ai domain since they are pipeline data, not team members. The demo picks up the new emails on the next scheduled reset

## [2.13.10] (2026-08-09)

Amber warning text readable in light mode. Timestamp: 2026-08-09 23:42 UTC.

### Fixed

- The demo banner, the Settings API key note, and the Docs demo callout all use `text-amber-200/90`, but amber was never declared in the theme token set, so light mode showed pale amber text on a near-white background. `--color-amber-200` and `--color-amber-500` are now declared in `src/index.css` like every other palette color: dark keeps the Tailwind defaults, light remaps the text to a deep amber (#92400e) and the border and tint to amber 600 (#d97706). An audit of every raw palette class in src confirmed amber was the only color missing a light remap

## [2.13.9] (2026-08-09)

Compare page catches up with Slack and table settings. Timestamp: 2026-08-09 23:26 UTC.

### Added

- Slack row on the Compare page: the upstream project has no Slack integration, while this port ships optional notifications for new records, deal stage moves, task completions, and agent runs, plus the /crm slash command bot over signed HTTP actions, all off by default (`src/pages/Compare.tsx`)
- Tables and custom fields row: per-entity column rename, hide, and pin, new-record defaults, and custom fields in four types that render as sortable, editable columns, versus fixed columns upstream (`src/pages/Compare.tsx`)

## [2.13.8] (2026-08-09)

Landing bento absorbs the agents section and gains Slack, web research, and Ask cards. Timestamp: 2026-08-09 23:20 UTC.

### Changed

- The standalone "Agents that automate your CRM" section is gone; it now lives inside the "What it actually does" bento as a two column card pairing the agent prompt input and seeded prompt examples with a "Your agents" panel showing the deployed Renewal briefer (v1, weekdays 13:00 UTC) and the draft Stale deal flagger, both from the real seed data (`src/pages/Landing.tsx`)
- Three new bento cards: "Slack hears about it first" mocks a #deals channel message for a Roo Capital stage change plus the `/crm` slash command, "It reads the web for you" mocks the `search_web` (Exa) and `read_page` (Firecrawl) tool call rows ending in a recorded fact, and "One chat runs the whole CRM" mocks a `/task` exchange with the reminder confirmation and slash command chips
- Grid rebalanced: agent builder and companies span two columns, record chat stays the tall right rail, the three new cards form a middle row, activity log spans two columns with more agent entries, and BYOK keeps the full bottom row. Verified with screenshots in dark and light mode

## [2.13.7] (2026-08-09)

Landing page "What it actually does" rebuilt as a bento with mock UI blocks. Timestamp: 2026-08-09 23:08 UTC.

### Changed

- The "What it actually does" section is now a three column bento (max-w-5xl) where every card pairs its heading with a screenshot style mock UI block built in JSX from the app's own theme tokens: a companies table with real seeded logos and Enriched/Researching badges, a record chat with suggested questions, a question and answer exchange, and an input row, a suggested agents list, a follow-up recheck list with day chips and the WHY note, and a mono activity log strip. All names, domains, deals, and env keys come from the real seeded demo data (`src/pages/Landing.tsx`)
- New "Bring your own keys" BYOK card spanning two columns groups every optional provider by capability (Chat: OpenAI, Claude, OpenRouter; Research: Context.dev, Firecrawl, Exa; Email: Resend, AgentMail) with the real env key name under each, linking to the environment variables docs section
- The demo video section moved below "What it actually does" so visitors see what the product does before watching it. Verified with screenshots on localhost:5174 in dark and light mode at desktop and narrow widths

## [2.13.6] (2026-08-09)

Rybbit analytics added. Timestamp: 2026-08-09 23:00 UTC.

### Added

- Rybbit analytics script in the head of `index.html`, deferred so it never blocks first paint. The SPA router means the one tag covers every page: landing, compare, docs, and the app

## [2.13.5] (2026-08-09)

Landing page demo notes redesigned as a linked bullet list. Timestamp: 2026-08-09 22:58 UTC.

### Changed

- The "What the demo does and does not do" section on the landing page is now a bullet list with visible dot markers, a soft accent highlight on the config phrase in each line, environment variable names rendered as tinted mono pills, and a docs link on every bullet pointing at the matching section (using the app, fork and set it up, auth, email, Slack, web research, AI providers). The accent token remaps under html.light so the highlights stay readable in both themes; verified with screenshots in dark and light mode (`src/pages/Landing.tsx`)

## [2.13.4] (2026-08-09)

Custom themed checkboxes across the app. Timestamp: 2026-08-09 22:50 UTC.

### Changed

- The shared Checkbox in `src/components/ui.tsx` is now drawn from scratch: `appearance-none` on the native input, an inset dark well with a subtle border, an accent-blue fill on check, and a white checkmark that scales and fades in over 150ms. Hover brightens the border, keyboard focus gets an accent outline, disabled drops to 40 percent opacity. It stays a real input so wrapping labels and keyboard toggling keep working
- The sidebar preferences section in Settings (`src/app/Settings.tsx`) swapped its last native checkbox for the shared Checkbox, so every checkbox in the app (column choosers, select-all in tables and Activity, entity settings, timeline, sidebar prefs) renders the same themed control

## [2.13.3] (2026-08-09)

Footer credit line update. Timestamp: 2026-08-09 22:45 UTC.

### Changed

- The footer credit line on the homepage and Compare page now reads "Made with Cursor, Claude Fable and DNS Cloudflare." with links to cursor.com, claude.com, and the Cloudflare DNS docs (`src/pages/Landing.tsx`)

## [2.13.2] (2026-08-09)

Custom domain docs rewritten from the live realtimecrm.dev setup, plus a new email DNS guide. Timestamp: 2026-08-09 22:35 UTC.

### Added

- New "Email DNS with Cloudflare" docs section covering SPF, DKIM, and DMARC in plain language, the two Cloudflare rules (every email record is DNS only, one SPF record per name), the sending subdomain recommendation, Resend setup via Domain Connect or the manual three-record table, AgentMail's zero-DNS default plus custom domain records from the console, and the inbound webhook cross-link (`src/pages/Docs.tsx`)

### Changed

- The "Custom domain with Cloudflare" docs section now documents the apex-first setup verified live on realtimecrm.dev: apex CNAME to `convex.domains` proxied, `www` CNAME back to the apex proxied, TXT verification record, Full (strict) SSL, and a www-to-root redirect rule matching `www.yourdomain.com` exactly; replaces the earlier www-primary walkthrough with the dummy A record (`src/pages/Docs.tsx`)
- Added a troubleshooting list where every entry is a failure hit during the real setup with its cause: the redirect rule matching the apex (ERR_TOO_MANY_REDIRECTS), `www` pointed at `convex.domains` (Cloudflare error 1014), the Convex domain entry drifting from the DNS hostname (403), certificate minting delay, and browser-cached 301s (`src/pages/Docs.tsx`)
- The custom domain section closes with CLI and agent options: a scoped Cloudflare API token with curl examples for listing and creating records, and Cloudflare's MCP servers for docs lookups alongside the API for changes (`src/pages/Docs.tsx`)

## [2.13.1] (2026-08-09)

Clearer Cloudflare root to www redirect docs. Timestamp: 2026-08-09 20:05 UTC.

### Changed

- Step 5 of the custom domain docs section now follows Cloudflare's current wildcard pattern guidance: match `https://yourdomain.com/*`, target `https://www.yourdomain.com/${1}` with a 301 and preserve query string, created under Rules, Overview, Create rule; the older custom filter expression with `concat()` stays documented as an equivalent alternative (`src/pages/Docs.tsx`)

## [2.13.0] (2026-08-09)

Per-entity settings, renameable columns, custom field columns, and an upgraded table view. Timestamp: 2026-08-09 19:55 UTC.

### Added

- `tableSettings` table storing per-entity column preferences (rename, hide, pin) and new-record defaults (owner, industry, stage, currency, auto enrich), one row per entity with sparse column overrides (`convex/schema.ts`, `convex/tableSettings.ts`)
- Settings sections for Companies, Contacts, and Deals, each with three panels: new-record defaults that save on change, the full column list with inline rename (plus a "was X / restore" note), show and pin toggles, and the custom fields manager (`src/app/EntitySettingsSection.tsx`, `src/app/Settings.tsx`)
- Custom fields now support all four types (text, number, select, date) from Settings, can be renamed and have their select options edited in place, and archived fields can be restored; each active field becomes a real column in its entity's table (`convex/fields.ts`, `src/app/EntitySettingsSection.tsx`)
- Shared table infrastructure: per-column header menu (sort ascending and descending, pin, hide, reset) opened from a dots button, a Columns toolbar dropdown with visibility checkboxes and pin toggles, sticky pinned columns with measured offsets that survive horizontal scroll, and click-to-edit cells for custom field values (`src/components/dataTable.tsx`, `src/lib/columns.ts`)
- Companies, Contacts, and the Deals list view are column-driven: renames from Settings apply live, hidden columns disappear, pinned columns stick left, custom fields render as editable columns, and sorting works on built-in and custom columns (`src/app/Companies.tsx`, `src/app/Contacts.tsx`, `src/app/Deals.tsx`)
- Create mutations apply workspace defaults: new companies get the default industry and owner and respect the auto-enrich toggle, new contacts and deals get the default owner, and the New deal form prefills the default stage and currency (`convex/companies.ts`, `convex/contacts.ts`, `convex/deals.ts`, `src/app/Deals.tsx`)
- Company detail Overview custom fields are click-to-edit with the same cell editor the table uses (`src/app/CompanyDetail.tsx`)

### Changed

- The old Custom fields settings section is replaced by the per-entity sections; old `/app/settings/fields` bookmarks land on the Companies section (`src/app/Settings.tsx`)
- `fields.tableValues` batch query feeds table columns in one read instead of one query per row (`convex/fields.ts`)
- Header menus render in a fixed-position portal so they escape the table's horizontal scroll container, and the column menu button stays visible on touch screens while appearing on hover on desktop (`src/components/dataTable.tsx`)

## [2.12.1] (2026-08-09)

Footer credit line. Timestamp: 2026-08-09 17:25 UTC.

### Added

- "Built with Cursor and Fable." line under the footer tagline, shown on the homepage and Compare page only through a new `credit` prop on `SiteFooter`; the Docs page footer stays as it was (`src/pages/Landing.tsx`, `src/pages/Compare.tsx`)

## [2.12.0] (2026-08-09)

Calendar due dates for tasks. Timestamp: 2026-08-09 17:10 UTC.

### Added

- Themed `DateInput` calendar popover component following the custom Select pattern: month grid with prev and next, today highlight, Escape and outside click close (`src/components/ui.tsx`)
- Task composer due date modes: an "in days / on date" toggle where "in days" keeps the number field and "on date" opens the calendar picker; calendar picks land at 9:00 local time (`src/components/Timeline.tsx`)
- Ask `/task` explicit date phrases: "on Aug 15", "on August 15, 2026", "on 8/15", "on 8/15/2026", and "on 2026-08-15" set the due date at 16:00 UTC, and month-day phrases without a year roll forward once the date has passed; the confirmation replies "Due Aug 15" for explicit dates (`convex/ask.ts`)
- `shortDate` formatting helper for "Aug 15" style labels with the year shown only when it differs from the current one (`src/lib/format.ts`)

### Changed

- Timeline feed shows the actual date ("due Aug 15") when a task is due more than 7 days out instead of a large day count (`src/components/Timeline.tsx`)
- The `/task` slash hint and the docs Ask and Notes-and-tasks bullets mention the date phrases and the calendar picker (`src/app/Ask.tsx`, `src/pages/Docs.tsx`)

## [2.11.5] (2026-08-09)

Custom domain docs. Timestamp: 2026-08-09 16:55 UTC.

### Added

- "Custom domain with Cloudflare" docs section between Deploying to production and the coding agents section. It walks through adding a domain to Cloudflare, SSL/TLS settings (Full strict plus Always Use HTTPS), the three DNS records (proxied A record on the root, DNS only CNAME from www to convex.domains, and the \_convex_domains TXT verification record), adding the domain in the Convex dashboard for HTTP actions, the root to www redirect rule, curl verification steps with a troubleshooting checklist, and the optional CONVEX_CLOUD_URL override (`src/pages/Docs.tsx`)

## [2.11.4] (2026-08-09)

Demo banner restyle and Team demo note. Timestamp: 2026-08-09 16:45 UTC.

### Changed

- Demo mode banner now uses the same amber callout style as the Slack untested notice: amber border, tinted background, and a bold "Demo mode." lead-in (`src/components/DemoBanner.tsx`)

### Added

- "Demo users" callout at the top of Settings, Team while demo mode is on, explaining the people listed are fake seed data who cannot sign in or receive email; hidden once demo mode is off so forks see their real team (`src/app/Settings.tsx`)

## [2.11.3] (2026-08-09)

File an issue links. Timestamp: 2026-08-09 16:40 UTC.

### Added

- "File an issue" link to the fork's GitHub issues page (Issues are now enabled on the fork). One link sits in the site footer, which the homepage and Compare page share, and one sits below the section list in the docs sidebar (`src/pages/Landing.tsx`, `src/pages/Docs.tsx`)

## [2.11.2] (2026-08-09)

Docs prod commands and Slack untested notice. Timestamp: 2026-08-09 16:30 UTC.

### Added

- Untested callout at the top of the Slack docs section and the README Slack section: the integration follows Slack's current API docs but has not been run against a live workspace (`src/pages/Docs.tsx`, `README.md`)
- Every docs section that sets an env var now shows the `--prod` variant so production gets the same keys: the three Slack commands carry a second `--prod` line, and the fork setup, email, web research, and AI provider sections gained a `--prod` example with a one-line note that dev and production keep separate variables (`src/pages/Docs.tsx`)

## [2.11.1] (2026-08-09)

Docs sidebar search. Timestamp: 2026-08-09 15:05 UTC.

### Added

- Search box at the top of the docs sidebar. It filters the section list by title and by the rendered body text of each section, so terms like not_in_channel or RESEND_API_KEY surface the right section even when the label never mentions them. Escape clears the query (`src/pages/Docs.tsx`)

## [2.11.0] (2026-08-09)

Slack integration, off by default. Timestamp: 2026-08-09 12:10 UTC.

### Added

- Outbound Slack notifications with a master switch and per-event toggles: new companies and contacts, new deals and stage changes, task completions, and agent run summaries. Messages carry an Open in CRM deep link and deliveries retry with backoff through the action retrier component (`convex/slack.ts`, `convex/companies.ts`, `convex/contacts.ts`, `convex/deals.ts`, `convex/activities.ts`, `convex/agentTasks.ts`)
- Two connection modes: `SLACK_WEBHOOK_URL` for one fixed channel, or `SLACK_BOT_TOKEN` for the channel picker and the bot. Bot token wins when both are set; with neither, sends log as no-ops on the Activity page (`convex/slack.ts`, `convex/capabilities.ts`)
- Settings, Slack: master switch, env status badges for webhook, bot token, and signing secret, per-event toggles, a channel picker with search backed by Slack `conversations.list`, a send test button, the /crm bot switch, and an optional allowed email domain (`src/app/Settings.tsx`)
- The /crm slash command bot behind its own off-by-default toggle: `/crm find`, `/crm deal <name> <stage>`, `/crm note`, `/crm task`, `/crm activity`, `/crm help`. Three signed HTTP routes under `/webhooks/slack/` verify Slack's v0 signing scheme, ack inside the three second budget, and reply through response_url. Only workspace members can act, matched by Slack profile email against the Team list or an allowed domain, with writes attributed as Name (Slack) (`convex/slackBot.ts`, `convex/http.ts`)
- `slackIdentities` table caching verified Slack user to member mappings, re-verified after 30 days, plus Slack settings fields on the workspace row (`convex/schema.ts`)
- Shared `changeDealStage` model helper so stage moves from the UI and the bot patch, aggregate, log, and notify identically (`convex/model/deals.ts`, `convex/deals.ts`)
- Docs section "Slack: notifications and the bot" with both setup paths, scope list, slash command wiring, troubleshooting, and links to Slack's webhook, scopes, and request verification docs; four new rows in the env table (`src/pages/Docs.tsx`)
- README section on the Slack integration, four env table rows, and feature list lines; landing page adds Slack to the built with row and a demo note (`README.md`, `src/pages/Landing.tsx`)

### Notes

- Everything is off by default and demo mode never posts, so forks and the copy setup prompt work with zero Slack setup

## [2.10.0] (2026-08-09)

Mobile pass across the app and marketing pages. Timestamp: 2026-08-09 11:50 UTC.

### Added

- Mobile navigation for the app shell: below the md breakpoint the desktop sidebar hides and a top bar appears with the logo, a search button, and a hamburger menu that opens a right side drawer with all nav links, Settings, Docs, GitHub, Fork, and the theme toggle; Escape and the backdrop close it (`src/app/AppLayout.tsx`)

### Changed

- Companies, Contacts, Deals list view, and Activity tables scroll horizontally inside their panels on small screens instead of stretching the page (`src/app/Companies.tsx`, `src/app/Contacts.tsx`, `src/app/Deals.tsx`, `src/app/Activity.tsx`)
- Search inputs, filters, and new record form fields go full width on phones (`src/app/Companies.tsx`, `src/app/Contacts.tsx`, `src/app/Deals.tsx`, `src/app/Settings.tsx`)
- Ask stacks the thread sidebar above the chat on phones with a capped thread list, and the archive and delete row actions show without hover so they work on touch (`src/app/Ask.tsx`)
- Compose email becomes a fixed bottom sheet on phones; drag and resize stay desktop only (`src/components/ComposeEmail.tsx`)
- Command-K and the shortcuts modal sit higher with side padding on small screens (`src/components/CommandK.tsx`, `src/components/ShortcutsModal.tsx`)
- Company and contact detail pages wrap their header actions, stack the stat cards, and scroll the tab row (`src/app/CompanyDetail.tsx`, `src/app/ContactDetail.tsx`)
- Page headers wrap so action buttons drop below the title on narrow screens (`src/components/ui.tsx`)
- Landing hides the Compare and Docs header links on phones and wraps the hero buttons and footer links; the Compare table scrolls horizontally (`src/pages/Landing.tsx`, `src/pages/Compare.tsx`)
- Main content padding tightens on phones (`src/app/AppLayout.tsx`)

## [2.9.0] (2026-08-09)

Fork safety for the demo reset cron. Timestamp: 2026-08-09 11:35 UTC.

### Added

- `demo:disableDemoMode` internal mutation: one command (`npx convex run demo:disableDemoMode`, add `--prod` for production) flips the workspace out of demo mode so the reset cron stops wiping data and writes require a signed-in user (`convex/demo.ts`)
- "Turning off the demo reset" section in the README with a copy-paste coding agent prompt that disables demo mode and removes the cron; the `/docs` page carries the same command in the auth section and the same prompt in the coding agents section (`README.md`, `src/pages/Docs.tsx`)

### Changed

- `demo:reset` now checks the workspace before wiping: when demo mode is off it logs a skip to the Activity page and touches nothing, so a fork that never edits `convex/crons.ts` still cannot lose data (`convex/demo.ts`)
- The `demo reset` line in `convex/crons.ts` carries a FORKS comment pointing at the disable command and the README section

## [2.8.0] (2026-08-09)

Context.dev as a second provider for web search and web scraping. Timestamp: 2026-08-09 10:30 UTC.

### Added

- The chat agent's web research tools now accept two providers each: web search runs on Exa or Context.dev, and page reading runs on Firecrawl or Context.dev (`convex/web.ts`). Any one key enables its tool; with both set, the named provider leads and Context.dev covers a failed call. The same `CONTEXT_DEV_API_KEY` that powers brand enrichment covers both tools, so one key gives the agent the full research kit

### Changed

- Settings integration rows, the Compare page web search and scraping rows, the docs web research section and environment variable table, and the README now describe both providers per tool and the fallback order (`src/app/Settings.tsx`, `src/pages/Compare.tsx`, `src/pages/Docs.tsx`, `README.md`)
- Not-configured tool replies now name both keys that can turn the feature on, for example "Set EXA_API_KEY or CONTEXT_DEV_API_KEY to enable it"

### Fixed

- Prod deploy failing with `MissingEnvironmentVariables: EXA_API_KEY, FIRECRAWL_API_KEY` by setting the `unset` sentinels on the production deployment; dev and prod hold separate variables, so the sentinels must be set with `--prod` too. Making the app env vars optional does not work: Convex rejects binding a required component var to an optional app var, and the `convex/convex.config.ts` comment now explains this (2026-08-09 10:50 UTC)
- The docs deploy section and the README deploy section now put the `--prod` env commands before the deploy command; the old order ran the push first, which fails on a fresh production deployment (2026-08-09 10:55 UTC)

## [2.7.0] (2026-08-09)

A 20 second demo video on the landing page. Timestamp: 2026-08-09 10:00 UTC.

### Added

- Demo video section on the landing page, above "What it actually does": a silent 20 second dark mode walkthrough built from live app screenshots, opening with "The CRM built for agents, now on" the Convex logo, zooming on the pipeline stats, deal cards, agents, and Ask, and closing on "Just use" above the Convex logo; no audio track, Helvetica type, 2 MB 1080p (`src/pages/Landing.tsx`, `public/demo.mp4`, `public/demo-poster.png`)
- `heygen-assets/` is gitignored: video production scratch (screenshots, asset ids, session logs) stays local, and the HeyGen API key lives in the CLI's user config, never in the repo
- Terminal style git clone one liner with a copy button in the landing hero, below the CTA buttons and above the Built with divider (`src/pages/Landing.tsx`)

## [2.6.0] (2026-08-09)

Compose email from records, a Settings sub-sidebar, and a docs sidebar layout. Timestamp: 2026-08-09 09:25 UTC.

### Added

- Compose email: an Email button on company and contact pages opens a floating compose window that drags by its title bar and resizes from the corner, with To, Cc, Bcc, Subject, a markdown body with live preview, and file attachments stored in Convex file storage (`src/components/ComposeEmail.tsx`)
- Landing hero shows a terminal-style `git clone` one-liner with a copy button below the CTA buttons, above the Built with wall (`src/pages/Landing.tsx`)
- `email.compose` mutation writes an EMAIL activity on the record timeline and the Activity page, then schedules `email.sendComposed`, which delivers through the selected provider (Resend sends each recipient an individual copy so Bcc stays private; AgentMail uses native Cc and Bcc), appends the default signature, and turns attachments into signed download links; keyless installs log the skip instead of failing (`convex/email.ts`)
- Compose defaults in Settings: from name, from address, and a default signature stored on the workspace (`emailFromName`, `emailFromAddress`, `emailSignature` in `convex/schema.ts`); the from identity applies to Resend, since AgentMail sends from its inbox address
- Settings sub-sidebar: each concern is its own page under `/app/settings/:section` (Team, Integrations, Email, AI provider, Sidebar, Custom fields), matching the Ask sub-sidebar pattern (`src/app/Settings.tsx`, `src/App.tsx`)
- Docs sidebar layout: a sticky left navigation with active-section highlight while scrolling, in the style of Vercel's docs; the top table of contents remains on mobile (`src/pages/Docs.tsx`)
- Docs email section covers composing, from identity, signature, and attachment links, with links to the Resend and AgentMail component pages and Resend domain verification

### Changed

- Landing header link now says Fork and points at the GitHub fork URL (`src/pages/Landing.tsx`)

## [2.5.1] (2026-08-09)

Accessible text contrast in both themes, API key guidance inside Settings, and a keyboard shortcuts modal. Timestamp: 2026-08-09 09:20 UTC.

### Added

- Keyboard shortcuts modal: a Phosphor keyboard icon next to the theme switcher in the sidebar footer opens a themed list of every shortcut; `⌘?` toggles the modal and `⌘.` collapses or expands the sidebar, with Ctrl as the modifier on non-Mac keyboards (`src/components/ShortcutsModal.tsx`, `src/app/AppLayout.tsx`)
- "Adding API keys" panel in Settings: shows the `npx convex env set` command for dev and the same command with `--prod`, explains that every Convex project has two deployments with separate variables, and links to the environment variables and deploy docs sections (`src/app/Settings.tsx`)
- A "Setup guide" link on every Integrations row in Settings, pointing at the docs section for that key (email, web research, AI providers, environment variables)
- Docs page now scrolls to the section when opened with a hash like `/docs#email` from anywhere in the app (`src/pages/Docs.tsx`)
- Email provider and AI provider panels in Settings link to their docs sections

### Changed

- Muted text colors raised to WCAG AA contrast in both themes: dark `neutral-500`/`neutral-600` are now `#9a9a9a`/`#808080` on the near-black canvas, light mode grays deepened to `#626d7a`/`#6d7683` on white, with the rest of the ramp nudged to keep hierarchy (`src/index.css`)
- Landing headline now reads "The CRM built for agents on Convex", matching the og.png share image (`src/pages/Landing.tsx`)

## [2.5.0] (2026-08-09)

Notes and tasks, streamed Ask replies, full text search, themed form controls, sidebar collapse, and activity multi-select. Timestamp: 2026-08-09 08:45 UTC.

### Added

- Notes and tasks on companies and contacts: a shared composer with a note/task toggle, due date in days, an optional "email me a reminder" that routes through the selected email provider at the due time, and Complete buttons on open tasks (`src/components/Timeline.tsx`, `convex/model/activities.ts`)
- `/task` and `/note` slash commands in Ask, handled in the send mutation with no AI key required: a company or contact name in the text links the record, "email me" schedules a reminder, "in N days" or "tomorrow" sets the due date, and a confirmation message lands in the thread (`convex/ask.ts`)
- Streamed Ask replies: `ask.generate` uses `streamText` with saved deltas and the client renders them live through `useUIMessages` with `stream: true`
- Full text search indexes (`search_name`) on companies, contacts, and deals; Command-K queries them first with the old bounded scan kept as a fallback for domain and email matches (`convex/schema.ts`, `convex/search.ts`)
- Themed `Select`, `NumberInput`, and `Checkbox` primitives in `src/components/ui.tsx`; every native select and number spinner replaced (Deals stage menus, new deal form, Contacts and Companies filters, contact inline add, recheck days)
- Sidebar collapse: Phosphor SidebarSimple icon in the sidebar header, floating reopen button when hidden, preference persisted per browser
- Activity page multi-select: checkbox per row, select-all header, Clear selected via the new `logs.clearMany` mutation
- Timeline writes (`activities:create`, `activities:completeTask`) now log to the Activity page, so record timelines and the log tell one story
- Night-aware Ask greeting ("Up late." before 5am, "Working late." after 10pm)

### Changed

- `activities.create` accepts `remindMe` and shares its write path with the Ask slash commands (`convex/model/activities.ts`)
- Compare page: workspace chat row mentions streaming and slash tasks; new notes and tasks row; search row mentions the full text indexes
- Docs and README updated for all of the above

## [2.4.0] (2026-08-09)

Ask chat, activity log, Command-K, table upgrades, and multi-provider AI. Timestamp: 2026-08-09 08:05 UTC.

### Added

- Ask page (`/app/ask`): a Claude-style workspace chat with slash commands (`/search`, `/read`, `/crm`), a sub-sidebar of past chats with archive and delete, and the same web research tools the record chat uses (`convex/ask.ts`, `src/app/Ask.tsx`)
- AI provider picker in Settings: OpenAI (`gpt-5-mini`), Claude (`claude-sonnet-4-5`), or OpenRouter; stored as `aiProvider` on the workspace; no key ships by default and the chat names the missing key (`convex/ai.ts`, `convex/prefs.ts`, `@ai-sdk/anthropic`)
- Command-K search palette over companies, contacts, and deals, opened with the keyboard or the sidebar Search button (`convex/search.ts`, `src/components/CommandK.tsx`)
- Activity page (`/app/activity`): a live dashboard-style log of function outcomes with pause and clear, wiped by the demo reset like everything else (`convex/logs.ts`, `src/app/Activity.tsx`)
- Log events recorded from CRM mutations, agent task completion, email sends, demo resets, and chat generations
- Sidebar drag-and-drop reordering, persisted on the workspace; Settings gained show/hide checkboxes per item (`sidebarOrder`, `sidebarHidden`)
- Deals list view: sortable columns beside the existing board, with a board/list toggle
- Drag-and-drop stage moves on the Deals board
- Companies table: sortable headers, enrichment status filter, inline add row
- Contacts table: sortable headers, company filter, inline add row
- Fork link in the app sidebar; small "demo" badge next to the header wordmark
- Docs: AI providers section, auth section rewritten around the [Convex auth overview](https://docs.convex.dev/auth/overview) with Clerk, WorkOS AuthKit, Auth0, and custom OIDC links, and an explicit note that the static hosting component is pre-configured

### Changed

- Landing page spacing tightened across every section; the Create agent button no longer stretches
- Built with section gained a second row with OpenAI, Claude, and OpenRouter
- Compare page gained rows for AI providers, workspace chat, search, and observability
- README updated with the new features, env vars, and compare rows
- `public/og.png` recaptured at 1200x630 from the new landing layout: hero reads "The CRM built for agents on Convex" with both built-with logo rows (Convex, React, Vite, context.dev, Firecrawl, AgentMail, Exa, OpenAI, Claude, OpenRouter) in frame

## [2.3.0] (2026-08-09)

Web research components, email provider toggle, docs page, and the Composio/Minimax theme pass. Timestamp: 2026-08-09 07:25 UTC.

### Added

- Firecrawl component (`@firecrawl/firecrawl-convex`): the record chat agent can read any web page as markdown through a `read_web_page` tool (`convex/web.ts`, `convex/chat.ts`)
- Exa component (`@exalabs/convex-exa`): semantic web search as a `search_the_web` chat tool with the same keyless graceful degradation
- AgentMail component (`@agentmail/convex`): persistent agent inbox, durable sending, and an inbound webhook at `/agentmail/webhook` (`convex/email.ts`, `convex/http.ts`)
- Email provider toggle in Settings: pick Resend or AgentMail per workspace; stored as `emailProvider` on the workspace row and routed in `email.sendNotification`
- `convex/capabilities.ts` query reporting which integrations have real keys; Settings shows live configured / not set badges
- Docs page at `/docs`: fork and setup for non-devs, env var reference, email and web research setup, Convex Auth guide, production deploy with `--prod`, coding agent instructions, and the full component list; linked in the header, footer, and the app sidebar
- Light mode (Minimax style) with a theme toggle in the landing header and the sidebar footer, persisted in localStorage and applied before first paint
- Open Graph and Twitter card metadata in `index.html` with a 1200x630 dark mode share image at `public/og.png`
- GitHub repo links (waynesutton/trycrm-convex) in the header, footer, fork section, and sidebar

### Changed

- Dark theme moved from the GitHub palette to the Composio pattern: near-black `#0f0f0f` canvas, achromatic surfaces, hairline borders, white CTA fill, `#51a2ff` links; light mode follows Minimax with a `#181e25` CTA and `#1456f0` links (`src/index.css`)
- The palette utilities the app uses (white, neutral steps, badge tones) are declared as theme tokens and remapped under `html.light`, so every screen flips with the toggle
- Built with section restacked: a larger Convex logo sits centered on its own row with React, Vite, context.dev, Firecrawl, AgentMail, and Exa on one line below; white marks invert to ink in light mode
- Setup prompt now sets all three sentinel keys: `CONTEXT_DEV_API_KEY`, `FIRECRAWL_API_KEY`, `EXA_API_KEY`
- Compare page gained rows for agent inbox, web scraping, and web search; the email row notes the provider toggle
- README rewritten with the live demo links, the new components, the email section, and the updated deploy steps

## [2.2.0] (2026-08-08)

GitHub design system restyle. Timestamp: 2026-08-09 06:37 UTC.

### Added

- Mona Sans variable font via @fontsource-variable/mona-sans
- White React and Vite SVG logos in `public/logos/` for the Built with wall

### Changed

- Theme tokens moved to the GitHub features palette: `#0d1117` canvas, `#161b22` panel, `#21262d` raised, `#30363d` hairline borders, cobalt `#1f6feb` primary button, `#58a6ff` link accent (`src/index.css`)
- Corner radii tightened across the landing page and app: buttons and inputs `rounded-md`, panels `rounded-lg`, no more `rounded-xl`
- Header and sidebar now say "CRM on Convex" as text; the Convex logo moved to the Built with section alongside white React, Vite, and context.dev marks
- Primary buttons are cobalt with white text instead of the emerald accent fill
- Hero gained a purple radial glow behind a cobalt primary CTA, matching the GitHub features layout

### Removed

- Reset now button from the demo banner; resets are cron only

### Fixed

- Cloud deploy error `MissingEnvironmentVariables: CONTEXT_DEV_API_KEY` by setting the variable on the dev deployment (`npx convex env set CONTEXT_DEV_API_KEY unset`); the copy prompt and docs keep the "unset" sentinel for people cloning the repo

## [2.1.0] (2026-08-08)

Lint and helpers pass. Timestamp: 2026-08-09 06:05 UTC.

### Added

- ESLint 9 flat config with the Convex plugin recommended rules and type aware typescript-eslint (`eslint.config.js`, `npm run lint`)
- `writeMutation` custom mutation in `convex/model/functions.ts`, built on convex-helpers; the write access check now runs once in the wrapper instead of by hand in every mutation

### Changed

- All database `get`, `patch`, `replace`, and `delete` calls now pass the table name explicitly, per the `explicit-table-ids` rule
- All public mutations in companies, contacts, deals, activities, fields, agents, agentTasks, and chat now use `writeMutation`

## [2.0.0] (2026-08-08)

Full port to Convex. Timestamp: 2026-08-09 05:45 UTC.

### Added

- Single Convex deployment replaces the Turborepo monorepo: `convex/` backend plus `src/` Vite React frontend, npm instead of bun
- Convex components: static-hosting, agent, workflow, workpool (three pools), crons, action-retrier, action-cache, rate-limiter, aggregate (two instances), migrations, resend, and the Context.dev partner component
- Demo mode with a 10 minute reset cron, live countdown banner, and self-seeding workspace
- Landing page served by static hosting with a Try the demo button, copy prompt button, and Convex branding
- Compare page at `/compare` contrasting the upstream stack with this port
- Record chat backed by the agent component, with honest degradation when no model key is set
- Agents that build agents: draft definitions with versioned instructions, deploy as a pointer move
- Evidence ledger, scheduled rechecks with required reasons, and Context.dev enrichment with a 7 day action cache

### Changed

- Hosting moved from Vercel to the Convex static hosting component
- Database moved from Postgres and Prisma to the Convex database
- Queues moved from Redis workers to workpool components with the queue as a table
- Auth moved from Better Auth to a Convex Auth ready layout, disabled in the demo
- README rewritten for the Convex version, including the deploy guide

### Removed

- Vercel, Postgres, Prisma, Redis, Better Auth, NestJS API, Next.js, bun, Turborepo

Upstream changelog continues below.

## [1.5.0](https://github.com/trycompai/crm/compare/v1.4.0...v1.5.0) (2026-08-08)


### Features

* **agent:** bound agent builder retries and improve chat scrolling ([#89](https://github.com/trycompai/crm/issues/89)) ([7780f81](https://github.com/trycompai/crm/commit/7780f81a219813fcf54e6b5dd612a7d40e31d32b))


### Fixes

* **agent:** declare granted write actions in draft access summary ([#93](https://github.com/trycompai/crm/issues/93)) ([ad4f9f3](https://github.com/trycompai/crm/commit/ad4f9f31c81fd6bdad89abb6adb5a208d51c19ed))
* **app:** render agent transcript chronologically with anchored tool results ([#92](https://github.com/trycompai/crm/issues/92)) ([0e68e45](https://github.com/trycompai/crm/commit/0e68e45909182c875ea58ba18fb89d9a87032e11))

## [1.4.0](https://github.com/trycompai/crm/compare/v1.3.0...v1.4.0) (2026-08-07)


### Features

* **agent:** CMP-1 add sandboxed builder and runner runtimes ([#60](https://github.com/trycompai/crm/issues/60)) ([d033dbf](https://github.com/trycompai/crm/commit/d033dbf0a0bc966499454a402219b65130b6397a))
* **app:** CMP-12 review agent drafts before deployment ([#63](https://github.com/trycompai/crm/issues/63)) ([51a4a11](https://github.com/trycompai/crm/commit/51a4a118432863980c88dc0f7c0d9e56aa4462ae))
* **app:** CMP-46 add the private agent builder workspace ([#62](https://github.com/trycompai/crm/issues/62)) ([f64c88f](https://github.com/trycompai/crm/commit/f64c88fe9d3e1a72e67e630f01817f75cfddaedd))
* **app:** CMP-47 add inline composer context ([57336ab](https://github.com/trycompai/crm/commit/57336abc2cc5d599aa1467bae0345482ac3de1d5))
* **db:** CMP-1 persist durable custom agents ([#67](https://github.com/trycompai/crm/issues/67)) ([4e79f83](https://github.com/trycompai/crm/commit/4e79f837dba6654806a1d3f99632ec34343a2b6d))


### Fixes

* **app:** CMP-47 consolidate agent builder presentation ([#64](https://github.com/trycompai/crm/issues/64)) ([1809d27](https://github.com/trycompai/crm/commit/1809d277c31f64b2ea3dd44615175b47bcbbda34))
* **app:** move chat beneath overview in icon rail ([#83](https://github.com/trycompai/crm/issues/83)) ([b63497d](https://github.com/trycompai/crm/commit/b63497d07c5c33d119b9d759c81341e422afd8cd))
* **ci:** tag releases automatically and keep previews off the production schema ([#82](https://github.com/trycompai/crm/issues/82)) ([6078a84](https://github.com/trycompai/crm/commit/6078a84b4fa435914f77601dc2c6e67c28de4bc3))


### Refactors

* **app:** CMP-59 harden CRM UI foundations ([#61](https://github.com/trycompai/crm/issues/61)) ([d8123e6](https://github.com/trycompai/crm/commit/d8123e6dd6a02986d0a9211c68dfaa110cdc0901))

## [1.3.0](https://github.com/trycompai/crm/compare/v1.2.0...v1.3.0) (2026-08-07)


### Features

* **api:** add microsoft sign-in and outlook mailbox sync ([#73](https://github.com/trycompai/crm/issues/73)) ([2a0062f](https://github.com/trycompai/crm/commit/2a0062fb76ffdaa5bbbb3848a5573b8b53cd0036))
* **api:** enhance email domain handling with machine address detection ([70d7e84](https://github.com/trycompai/crm/commit/70d7e84b6532a45fae8cdf98e73aa3f19ff39fbb))
* **api:** enhance onboarding and research key handling ([f1d1332](https://github.com/trycompai/crm/commit/f1d133213042573672fc0a1d819290221eb686a1))
* **api:** implement Context.dev key verification and enhance capabil… ([d42a04e](https://github.com/trycompai/crm/commit/d42a04ec0d2a3d1d35839e8958ad01e12e8f0de0))
* **api:** implement Context.dev key verification and enhance capabilities handling ([5ca4eae](https://github.com/trycompai/crm/commit/5ca4eae9871615bfbffededaceeca2a9e4598348))
* **api:** implement delete functionality for companies, contacts, an… ([96bf31b](https://github.com/trycompai/crm/commit/96bf31b72d0c8d8931d124e8670e2fc02601f830))
* **api:** implement delete functionality for companies, contacts, and deals ([4457f73](https://github.com/trycompai/crm/commit/4457f7348a222ef32d34dedb74c75202c50a01a1))
* **app:** add dashboard and overview components for enhanced user experience ([181bd28](https://github.com/trycompai/crm/commit/181bd28b016c1abacaeec3cf3581e76011af6152))
* **brand-mapping:** introduce fillable function and enhance brand update logic ([aad5945](https://github.com/trycompai/crm/commit/aad59457baca4d99fcb0e693e86623c593fccae7))
* **landing:** enhance agent section and footer for improved layout and user engagement ([ad4ceaa](https://github.com/trycompai/crm/commit/ad4ceaa9abec8eb5a829a2c6d8553614441e3519))
* **proxy:** implement marketing flag for landing page visibility ([81a36d6](https://github.com/trycompai/crm/commit/81a36d66da79564a01a68af43c8639bfd676bdfd))
* **seo-audit:** add SEO audit skill and related resources ([f266040](https://github.com/trycompai/crm/commit/f266040348e91c689170be5d459fe8a9dbf5df64))
* **turbo:** update test dependencies and document workspace behavior ([6d2e6e4](https://github.com/trycompai/crm/commit/6d2e6e445c0618fb73f30f161767f52b647064b3))


### Fixes

* **app:** generate route types before type checking ([03d4069](https://github.com/trycompai/crm/commit/03d406976cc0a15601b53516a3041c27606489ed))
* **proxy:** refine redirect logic for sign-in path ([73875f0](https://github.com/trycompai/crm/commit/73875f0cc22852a035a4f832beb3ced6d111decd))
* **proxy:** update redirect logic for signed-out users ([8871e49](https://github.com/trycompai/crm/commit/8871e49d153db694933537a6ac28219d7761478b))


### Refactors

* **api:** enhance deletion logic and activity stamp handling ([68f6014](https://github.com/trycompai/crm/commit/68f6014eeb68b3fe863fd81e7cb266e2a309d4d0))
* **api:** improve email normalization and enhance record deletion handling ([277afef](https://github.com/trycompai/crm/commit/277afef311bd0aa3f48443046052d588c912d673))
* **api:** update record deletion tests and enhance agent task handling ([82694a6](https://github.com/trycompai/crm/commit/82694a6c4a3b9774e672207e9ca9f413c96dd9fe))
* **landing:** remove unused Link imports from agent and capabili… ([e2a5a7f](https://github.com/trycompai/crm/commit/e2a5a7fc8dd42bdb210e4b1ea851ebde46195392))
* **landing:** remove unused Link imports from agent and capabilities sections ([66213dd](https://github.com/trycompai/crm/commit/66213dd2dec88954a831771ccb087f78ce7d7e20))
* **landing:** replace Link components with divs for improved layout consistency ([79749f5](https://github.com/trycompai/crm/commit/79749f5e0f760a7d8ceacac6a02e5c30e1d9d2e1))
* **proxy:** streamline onboarding and research gate handling ([a189eab](https://github.com/trycompai/crm/commit/a189eab99a74e574ca95df8648d58c9109bad0e1))
* **proxy:** streamline onboarding and research gate handling ([14cb932](https://github.com/trycompai/crm/commit/14cb93285600164f61834126098ad7d507141f82))


### Documentation

* **env:** document landing page behavior based on IS_MARKETING flag ([bde4fd5](https://github.com/trycompai/crm/commit/bde4fd55aeb848f3fb7b4ee207f12c5bf37c7866))
* **env:** update .env.example and api.md to clarify marketing flag usage ([34900ae](https://github.com/trycompai/crm/commit/34900ae78faa490f0bbe6fc8d9a2fc742f7dd959))
* **README:** add stars badge for project visibility ([4dd7e90](https://github.com/trycompai/crm/commit/4dd7e90632d98911c5a4531848ef6bdf9626eb19))
* **README:** align images for better presentation in the README ([a075794](https://github.com/trycompai/crm/commit/a075794975b2beef2cdab16cf11e38b5d0bd3423))
* **README:** remove duplicate stars badge and improve project visibility ([96173a1](https://github.com/trycompai/crm/commit/96173a1ebb6f37167cac443a4f508ef7f15433cb))
* **README:** update stars badge positioning for improved visibility ([b48268e](https://github.com/trycompai/crm/commit/b48268e18cf93686006a7d57ee31918fb41c8ecb))

## [1.2.0](https://github.com/trycompai/crm/compare/v1.1.0...v1.2.0) (2026-08-07)


### Features

* **api:** add microsoft sign-in and outlook mailbox sync ([#73](https://github.com/trycompai/crm/issues/73)) ([2a0062f](https://github.com/trycompai/crm/commit/2a0062fb76ffdaa5bbbb3848a5573b8b53cd0036))

## [1.1.0](https://github.com/trycompai/crm/compare/v1.0.0...v1.1.0) (2026-08-06)


### Features

* **api:** enhance email domain handling with machine address detection ([70d7e84](https://github.com/trycompai/crm/commit/70d7e84b6532a45fae8cdf98e73aa3f19ff39fbb))
* **api:** enhance onboarding and research key handling ([f1d1332](https://github.com/trycompai/crm/commit/f1d133213042573672fc0a1d819290221eb686a1))
* **api:** implement Context.dev key verification and enhance capabil… ([d42a04e](https://github.com/trycompai/crm/commit/d42a04ec0d2a3d1d35839e8958ad01e12e8f0de0))
* **api:** implement Context.dev key verification and enhance capabilities handling ([5ca4eae](https://github.com/trycompai/crm/commit/5ca4eae9871615bfbffededaceeca2a9e4598348))
* **api:** implement delete functionality for companies, contacts, an… ([96bf31b](https://github.com/trycompai/crm/commit/96bf31b72d0c8d8931d124e8670e2fc02601f830))
* **api:** implement delete functionality for companies, contacts, and deals ([4457f73](https://github.com/trycompai/crm/commit/4457f7348a222ef32d34dedb74c75202c50a01a1))
* **app:** add dashboard and overview components for enhanced user experience ([181bd28](https://github.com/trycompai/crm/commit/181bd28b016c1abacaeec3cf3581e76011af6152))
* **landing:** enhance agent section and footer for improved layout and user engagement ([ad4ceaa](https://github.com/trycompai/crm/commit/ad4ceaa9abec8eb5a829a2c6d8553614441e3519))
* **proxy:** implement marketing flag for landing page visibility ([81a36d6](https://github.com/trycompai/crm/commit/81a36d66da79564a01a68af43c8639bfd676bdfd))
* **seo-audit:** add SEO audit skill and related resources ([f266040](https://github.com/trycompai/crm/commit/f266040348e91c689170be5d459fe8a9dbf5df64))
* **turbo:** update test dependencies and document workspace behavior ([6d2e6e4](https://github.com/trycompai/crm/commit/6d2e6e445c0618fb73f30f161767f52b647064b3))


### Fixes

* **app:** generate route types before type checking ([03d4069](https://github.com/trycompai/crm/commit/03d406976cc0a15601b53516a3041c27606489ed))
* **proxy:** refine redirect logic for sign-in path ([73875f0](https://github.com/trycompai/crm/commit/73875f0cc22852a035a4f832beb3ced6d111decd))
* **proxy:** update redirect logic for signed-out users ([8871e49](https://github.com/trycompai/crm/commit/8871e49d153db694933537a6ac28219d7761478b))


### Refactors

* **api:** enhance deletion logic and activity stamp handling ([68f6014](https://github.com/trycompai/crm/commit/68f6014eeb68b3fe863fd81e7cb266e2a309d4d0))
* **api:** improve email normalization and enhance record deletion handling ([277afef](https://github.com/trycompai/crm/commit/277afef311bd0aa3f48443046052d588c912d673))
* **api:** update record deletion tests and enhance agent task handling ([82694a6](https://github.com/trycompai/crm/commit/82694a6c4a3b9774e672207e9ca9f413c96dd9fe))
* **landing:** remove unused Link imports from agent and capabili… ([e2a5a7f](https://github.com/trycompai/crm/commit/e2a5a7fc8dd42bdb210e4b1ea851ebde46195392))
* **landing:** remove unused Link imports from agent and capabilities sections ([66213dd](https://github.com/trycompai/crm/commit/66213dd2dec88954a831771ccb087f78ce7d7e20))
* **landing:** replace Link components with divs for improved layout consistency ([79749f5](https://github.com/trycompai/crm/commit/79749f5e0f760a7d8ceacac6a02e5c30e1d9d2e1))
* **proxy:** streamline onboarding and research gate handling ([a189eab](https://github.com/trycompai/crm/commit/a189eab99a74e574ca95df8648d58c9109bad0e1))
* **proxy:** streamline onboarding and research gate handling ([14cb932](https://github.com/trycompai/crm/commit/14cb93285600164f61834126098ad7d507141f82))


### Documentation

* **env:** document landing page behavior based on IS_MARKETING flag ([bde4fd5](https://github.com/trycompai/crm/commit/bde4fd55aeb848f3fb7b4ee207f12c5bf37c7866))
* **env:** update .env.example and api.md to clarify marketing flag usage ([34900ae](https://github.com/trycompai/crm/commit/34900ae78faa490f0bbe6fc8d9a2fc742f7dd959))
* **README:** add stars badge for project visibility ([4dd7e90](https://github.com/trycompai/crm/commit/4dd7e90632d98911c5a4531848ef6bdf9626eb19))
* **README:** align images for better presentation in the README ([a075794](https://github.com/trycompai/crm/commit/a075794975b2beef2cdab16cf11e38b5d0bd3423))
* **README:** remove duplicate stars badge and improve project visibility ([96173a1](https://github.com/trycompai/crm/commit/96173a1ebb6f37167cac443a4f508ef7f15433cb))
* **README:** update stars badge positioning for improved visibility ([b48268e](https://github.com/trycompai/crm/commit/b48268e18cf93686006a7d57ee31918fb41c8ecb))

## 1.0.0 (2026-08-03)


### Features

* **brand-mapping:** introduce fillable function and enhance brand update logic ([aad5945](https://github.com/trycompai/crm/commit/aad59457baca4d99fcb0e693e86623c593fccae7))
