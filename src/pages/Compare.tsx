import { Link } from "react-router-dom";
import { SiteFooter, SiteHeader } from "./Landing";

type Row = {
  area: string;
  upstream: string;
  convex: string;
};

const ROWS: Array<Row> = [
  {
    area: "Hosting",
    upstream: "Vercel for the Next.js frontend, separate API deployment",
    convex: "Convex static hosting component serves the built Vite app",
  },
  {
    area: "Database",
    upstream: "Postgres with Prisma",
    convex: "Convex database with typed schema and indexes",
  },
  {
    area: "Realtime",
    upstream: "Client polling and cache invalidation",
    convex: "Reactive queries; every open client updates on write",
  },
  {
    area: "Agent runtime",
    upstream: "Node workers with Redis-backed queues",
    convex:
      "Agent component plus workpools; the queue is a table and mutations serialize claims",
  },
  {
    area: "Scheduling",
    upstream: "External schedulers and worker loops",
    convex: "Convex cron jobs, including the 10 minute demo reset",
  },
  {
    area: "Auth",
    upstream: "Better Auth",
    convex: "Ready for Convex Auth; disabled in the demo",
  },
  {
    area: "Email",
    upstream: "Resend SDK calls",
    convex:
      "Resend or AgentMail components, switchable in Settings; unconfigured on the demo",
  },
  {
    area: "Agent inbox",
    upstream: "Not included",
    convex:
      "AgentMail component: persistent inbox with threads synced into Convex tables",
  },
  {
    area: "Slack",
    upstream: "Not included",
    convex:
      "Optional notifications for new records, deal stage moves, task completions, and agent runs, plus a /crm slash command bot over signed HTTP actions. Off by default; webhook or bot token modes",
  },
  {
    area: "Web scraping",
    upstream: "Not included",
    convex:
      "Firecrawl or Context.dev components: the chat agent reads any web page as markdown. Either key works alone; with both set, Firecrawl leads and Context.dev covers failures",
  },
  {
    area: "Web search",
    upstream: "Not included",
    convex:
      "Exa or Context.dev components: web search as a tool the chat agent can call. Either key works alone; with both set, Exa leads and Context.dev covers failures",
  },
  {
    area: "AI providers",
    upstream: "OpenAI",
    convex:
      "DeepSeek (default), OpenAI, Claude, OpenRouter, or Grok, switchable in Settings. No key ships by default; the chat names the key it needs",
  },
  {
    area: "Workspace chat",
    upstream: "Per-record chat only",
    convex:
      "Ask page: a Claude-style chat over the whole CRM with streamed replies, slash commands including /task and /note, archived threads, and web research tools",
  },
  {
    area: "Notes and tasks",
    upstream: "Notes on records",
    convex:
      "Notes and tasks on every company and contact, with due dates, email reminders through the selected provider, and completion tracked on the timeline",
  },
  {
    area: "Tables and custom fields",
    upstream: "Fixed columns per table",
    convex:
      "Per-entity settings: rename, hide, and pin columns, new-record defaults, and custom fields (text, number, select, date) that become sortable, editable columns",
  },
  {
    area: "Search",
    upstream: "Per-table search inputs",
    convex:
      "Command-K palette backed by Convex full text search indexes, so it scales past demo size",
  },
  {
    area: "Observability",
    upstream: "Server logs",
    convex:
      "Activity page streams function outcomes live, dashboard-style, with pause, select one or all, and clear",
  },
  {
    area: "Brand enrichment",
    upstream: "Context.dev API with a Redis cache",
    convex:
      "Context.dev component with the action cache component, 7 day TTL",
  },
  {
    area: "Dashboard rollups",
    upstream: "SQL aggregate queries",
    convex: "Aggregate component: O(log n) sums and counts per stage",
  },
  {
    area: "Package manager",
    upstream: "bun with a Turborepo monorepo",
    convex: "npm with a single package",
  },
  {
    area: "Services to run",
    upstream: "Frontend, API, Postgres, Redis, workers",
    convex: "One Convex deployment",
  },
];

export function Compare() {
  return (
    <div className="min-h-screen bg-ink text-neutral-200">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-3xl font-semibold text-white">
          Original vs the Convex port
        </h1>
        <p className="mt-3 max-w-2xl text-neutral-500">
          The upstream project is{" "}
          <a
            href="https://github.com/trycompai/crm"
            className="text-neutral-300 underline decoration-edge underline-offset-2 hover:text-accent"
          >
            trycompai/crm
          </a>
          , an agentic CRM built on Next.js, Postgres, and Vercel. This port
          keeps the product and the agent design and replaces the
          infrastructure with one Convex deployment.
        </p>

        <div className="mt-8 overflow-x-auto rounded-lg border border-edge">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-edge bg-panel text-xs text-neutral-500">
                <th className="px-4 py-3 font-medium">Area</th>
                <th className="px-4 py-3 font-medium">trycompai/crm</th>
                <th className="px-4 py-3 font-medium">This version</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr
                  key={row.area}
                  className="border-b border-edge/60 last:border-0"
                >
                  <td className="px-4 py-3 align-top font-medium text-white">
                    {row.area}
                  </td>
                  <td className="px-4 py-3 align-top text-neutral-500">
                    {row.upstream}
                  </td>
                  <td className="px-4 py-3 align-top text-neutral-300">
                    {row.convex}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 rounded-lg border border-edge bg-panel p-5">
          <h2 className="text-sm font-medium text-white">
            What stayed the same
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500">
            The product ideas carried over intact: durable research agents,
            the evidence ledger where nothing about a person is guessed,
            rechecks that require a stated reason, agents that build agents,
            and asking any record a question. The Tailwind look carried over
            too.
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/app"
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-ink transition-colors hover:bg-primary-hover"
          >
            Try the demo
          </Link>
        </div>
      </main>
      <SiteFooter credit />
    </div>
  );
}
