import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "../components/ThemeToggle";
import { TextLink } from "../components/ui";

// The setup prompt users paste into their coding agent after forking.
// The three required keys stay "unset" here on purpose: the sentinel keeps
// the deploy working with no keys, and the app degrades honestly without
// them.
const SETUP_PROMPT =
  "Set up waynesutton/trycrm-convex. Install the dependencies with npm, run npx convex dev to create my deployment, set CONTEXT_DEV_API_KEY, FIRECRAWL_API_KEY, and EXA_API_KEY to the literal string unset, and tell me which optional keys I still need.";

export function Landing() {
  return (
    <div className="min-h-screen bg-ink text-neutral-200">
      <SiteHeader />
      <main>
        <Hero />
        <BuiltWith />
        <WhatItDoes />
        <DemoVideo />
        <DemoNotes />
        <ForkIt />
      </main>
      <SiteFooter credit />
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-edge bg-ink/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link to="/" className="text-sm font-semibold text-white">
          CRM on Convex
        </Link>
        <nav className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/compare"
            className="hidden text-sm text-neutral-400 transition-colors hover:text-white sm:block">
            Compare
          </Link>
          <Link
            to="/docs"
            className="hidden text-sm text-neutral-400 transition-colors hover:text-white sm:block">
            Docs
          </Link>
          <a
            href="https://github.com/waynesutton/trycrm-convex"
            className="text-sm text-neutral-400 transition-colors hover:text-white">
            GitHub
          </a>
          <ThemeToggle compact />
          <Link
            to="/app"
            className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-ink transition-colors hover:bg-primary-hover">
            Try the demo
          </Link>
        </nav>
      </div>
    </header>
  );
}

function CopyPromptButton() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(SETUP_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={() => void copy()}
      className="rounded-md bg-white/10 px-4 py-2 text-sm text-white transition-colors hover:bg-white/15">
      {copied ? "Copied" : "Copy the setup prompt"}
    </button>
  );
}

// Terminal-style clone one-liner for devs who skip the agent prompt.
function CloneCommand() {
  const [copied, setCopied] = useState(false);
  const command = "git clone https://github.com/waynesutton/trycrm-convex";
  const copy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="mx-auto mt-6 flex w-fit max-w-full items-center gap-4 rounded-lg border border-edge bg-white/[0.03] py-2 pl-4 pr-3">
      <code className="overflow-x-auto whitespace-nowrap font-mono text-sm text-neutral-300">
        <span className="select-none text-neutral-500">$ </span>
        git clone github.com/waynesutton/trycrm-convex
      </code>
      <button
        onClick={() => void copy()}
        className="shrink-0 font-mono text-xs text-neutral-500 transition-colors hover:text-white">
        {copied ? "copied" : "copy"}
      </button>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-32 h-[480px] bg-[radial-gradient(ellipse_55%_65%_at_50%_0%,var(--color-glow)_0%,transparent_75%)]"
      />
      <div className="relative mx-auto max-w-3xl px-4 pb-12 pt-16 text-center">
        <h1 className="text-4xl font-medium tracking-tight text-white sm:text-5xl">
          The CRM built for agents on Convex
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-7 text-neutral-400">
          Durable research agents read your pipeline, enrich records, and book their own follow-ups.
          One Convex deployment runs all of it.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/app"
            className="rounded-md bg-primary px-5 py-2.5 text-sm text-primary-ink transition-colors hover:bg-primary-hover">
            Try the demo
          </Link>
          <CopyPromptButton />
        </div>
        <CloneCommand />
      </div>
    </section>
  );
}

function BuiltWith() {
  return (
    <section className="border-y border-edge py-8">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 px-4">
        <span className="text-xs font-semibold text-neutral-500">Built with</span>
        <a href="https://convex.dev" aria-label="Convex">
          <img
            src="/convex-logo-white.png"
            alt="Convex"
            className="themed-logo h-11 opacity-90 transition-opacity hover:opacity-100"
          />
        </a>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <a
            href="https://react.dev"
            className="flex items-center gap-2 opacity-80 transition-opacity hover:opacity-100"
            aria-label="React">
            <img src="/logos/react-white.svg" alt="" className="themed-logo h-5 w-5" />
            <span className="text-sm font-semibold text-white">React</span>
          </a>
          <a
            href="https://vite.dev"
            className="flex items-center gap-2 opacity-80 transition-opacity hover:opacity-100"
            aria-label="Vite">
            <img src="/logos/vite-white.svg" alt="" className="themed-logo h-5 w-5" />
            <span className="text-sm font-semibold text-white">Vite</span>
          </a>
          <a
            href="https://context.dev"
            className="text-sm font-semibold text-white opacity-80 transition-opacity hover:opacity-100"
            aria-label="Context.dev">
            context.dev
          </a>
          <a
            href="https://www.firecrawl.dev"
            className="text-sm font-semibold text-white opacity-80 transition-opacity hover:opacity-100"
            aria-label="Firecrawl">
            Firecrawl
          </a>
          <a
            href="https://agentmail.to"
            className="text-sm font-semibold text-white opacity-80 transition-opacity hover:opacity-100"
            aria-label="AgentMail">
            AgentMail
          </a>
          <a
            href="https://exa.ai"
            className="text-sm font-semibold text-white opacity-80 transition-opacity hover:opacity-100"
            aria-label="Exa">
            Exa
          </a>
          <a
            href="https://slack.com"
            className="text-sm font-semibold text-white opacity-80 transition-opacity hover:opacity-100"
            aria-label="Slack">
            Slack
          </a>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <a
            href="https://openai.com"
            className="text-sm font-semibold text-white opacity-80 transition-opacity hover:opacity-100"
            aria-label="OpenAI">
            OpenAI
          </a>
          <a
            href="https://claude.com"
            className="text-sm font-semibold text-white opacity-80 transition-opacity hover:opacity-100"
            aria-label="Claude">
            Claude
          </a>
          <a
            href="https://openrouter.ai"
            className="text-sm font-semibold text-white opacity-80 transition-opacity hover:opacity-100"
            aria-label="OpenRouter">
            OpenRouter
          </a>
          <span className="text-xs text-neutral-600">bring your own key for any of these</span>
        </div>
      </div>
    </section>
  );
}

function DemoVideo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-14">
      <h2 className="text-2xl font-semibold text-white">See it in 19 seconds</h2>
      <p className="mt-2 text-neutral-400">
        Companies enrich themselves, deals move in real time, agents book their own follow-ups, and
        agents build agents. One Convex deployment runs all of it.
      </p>
      <div className="mt-6 overflow-hidden rounded-lg border border-edge bg-panel">
        <video
          controls
          playsInline
          preload="metadata"
          poster="/demo-poster.png"
          className="aspect-video w-full">
          <source src="/demo.mp4" type="video/mp4" />
        </video>
      </div>
    </section>
  );
}

// ---- WhatItDoes bento. Each card pairs a heading with a mock UI block
// built in JSX from the app's own tokens, so the blocks follow the theme
// and never go stale like screenshots. Names, domains, deals, and env keys
// are the real seeded demo data, not invented placeholders. ----

function BentoCard({
  title,
  body,
  className = "",
  children,
}: {
  title: string;
  body: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-col rounded-lg border border-edge bg-panel p-5 ${className}`}>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">{body}</p>
      <div className="mt-4 flex flex-1 flex-col">{children}</div>
    </div>
  );
}

// Tiny all-caps label used inside the mock blocks, like the app's own.
function MockLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-600">
      {children}
    </p>
  );
}

// Enrichment badges matching the Pill tones the real Companies table uses.
function MockEnrichBadge({ state }: { state: "enriched" | "researching" }) {
  if (state === "enriched") {
    return (
      <span className="rounded-full border border-emerald-800 px-2 py-0.5 text-[10px] text-emerald-400">
        Enriched
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-yellow-800 px-2 py-0.5 text-[10px] text-yellow-400">
      <span className="h-1 w-1 animate-pulse rounded-full bg-yellow-400" />
      Researching
    </span>
  );
}

// Three seeded companies from the live demo, logos included.
function MockCompanies() {
  const rows = [
    {
      name: "Tawkeed",
      domain: "tawkeed.ai",
      logo: "/landing/logos/tawkeed.webp",
      state: "enriched" as const,
    },
    {
      name: "Roo Capital",
      domain: "roocapital.com",
      logo: "/landing/logos/roo-capital.webp",
      state: "enriched" as const,
    },
    {
      name: "AuditBot",
      domain: "auditbot.co",
      logo: "/landing/logos/auditbot.webp",
      state: "researching" as const,
    },
  ];
  return (
    <div className="divide-y divide-edge rounded-md border border-edge bg-ink">
      {rows.map((row) => (
        <div key={row.name} className="flex items-center gap-3 px-3 py-2.5">
          <img src={row.logo} alt="" className="h-5 w-5 rounded" />
          <span className="text-xs font-medium text-white">{row.name}</span>
          <span className="ml-auto hidden font-mono text-xs text-neutral-500 sm:block">
            {row.domain}
          </span>
          <MockEnrichBadge state={row.state} />
        </div>
      ))}
    </div>
  );
}

// The record chat: suggested questions on top, input pinned to the bottom.
function MockRecordChat() {
  const suggestions = ["What do they do?", "Who do we know here?", "What has changed recently?"];
  return (
    <div className="flex flex-1 flex-col gap-2">
      <MockLabel>Suggested</MockLabel>
      {suggestions.map((q) => (
        <p key={q} className="rounded-md border border-edge bg-ink px-3 py-2 text-xs text-neutral-300">
          {q}
        </p>
      ))}
      <div className="mt-auto flex flex-col gap-2 pt-2">
        <p className="self-end rounded-md bg-raised px-3 py-2 text-xs text-white">
          Who do we know here?
        </p>
        <div className="rounded-md border border-edge bg-ink px-3 py-2">
          <p className="text-xs leading-relaxed text-neutral-300">
            Paula Marchetti runs fund ops. Last touch was five days ago on the renewal thread.
          </p>
          <p className="mt-1.5 font-mono text-[10px] text-neutral-600">
            read: timeline &middot; deals &middot; email
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-md border border-edge bg-ink py-1.5 pl-3 pr-1.5">
        <span className="flex-1 text-xs text-neutral-600">What do they sell?</span>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-ink">
          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </div>
  );
}

// The agent builder, absorbing the old standalone AgentsSection: the
// "What should we get done?" prompt box next to the real seeded agent
// roster with its deploy state and schedule.
function MockAgentBuilder() {
  const prompts = [
    "Create a channel and notify the owner when a deal hits Closed won",
    "Brief every deal owner before a renewal call",
    "Every Monday, re-enrich contacts not touched in 4 weeks",
  ];
  return (
    <div className="grid flex-1 gap-3 sm:grid-cols-[1.4fr_1fr]">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 rounded-md border border-edge bg-ink py-1.5 pl-3 pr-1.5">
          <span className="flex-1 text-xs text-neutral-600">What should we get done?</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-ink">
            <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
        {prompts.map((p) => (
          <p
            key={p}
            className="flex items-center justify-between gap-2 rounded-md border border-edge bg-ink px-3 py-2 text-xs text-neutral-400"
          >
            {p}
            <span aria-hidden className="shrink-0 text-neutral-600">
              &rarr;
            </span>
          </p>
        ))}
      </div>
      <div className="rounded-md border border-edge bg-ink p-3">
        <MockLabel>Your agents</MockLabel>
        <div className="mt-2 flex flex-col gap-2.5">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-medium text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Renewal briefer
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-neutral-500">
              v1 deployed &middot; weekdays 13:00 UTC
            </p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-xs font-medium text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-600" />
              Stale deal flagger
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-neutral-500">draft &middot; not deployed</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// A Slack message the deals channel actually receives, using the real
// notification format from convex/model/deals.ts and the /crm bot.
function MockSlack() {
  return (
    <div className="flex flex-1 flex-col rounded-md border border-edge bg-ink p-3">
      <p className="font-mono text-[10px] text-neutral-600"># deals</p>
      <div className="mt-2.5 flex gap-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary text-[10px] font-bold text-primary-ink">
          C
        </span>
        <div className="min-w-0">
          <p className="text-xs">
            <span className="font-semibold text-white">CRM</span>{" "}
            <span className="rounded-sm bg-raised px-1 py-px text-[9px] font-medium text-neutral-500">
              APP
            </span>{" "}
            <span className="text-[10px] text-neutral-600">2:14 PM</span>
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-neutral-300">
            Deal stage: Roo Capital fund ops: Negotiation &rarr; Closed won
          </p>
        </div>
      </div>
      <div className="mt-auto flex items-center gap-2 pt-3">
        <span className="rounded-md border border-edge bg-raised px-2.5 py-1.5 font-mono text-[11px] text-neutral-400">
          /crm what moved this week?
        </span>
      </div>
    </div>
  );
}

// The research tool-call trail: Exa searches, Firecrawl reads the page,
// and the fact lands with its source attached.
function MockWebResearch() {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-1.5 rounded-md border border-edge bg-ink p-3 font-mono text-[11px]">
        <div className="flex items-center gap-2">
          <span className="text-accent">&#9656;</span>
          <span className="text-neutral-300">search_web</span>
          <span className="ml-auto text-neutral-600">exa &middot; 6 results</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-accent">&#9656;</span>
          <span className="text-neutral-300">read_page</span>
          <span className="ml-auto text-neutral-600">firecrawl &middot; 2.1s</span>
        </div>
        <p className="mt-1 truncate text-neutral-500">auditbot.co/pricing</p>
      </div>
      <div className="mt-auto rounded-md border border-edge bg-ink px-3 py-2">
        <MockLabel>Fact recorded</MockLabel>
        <p className="mt-1 text-xs leading-relaxed text-neutral-300">
          Headcount: 12, from the AuditBot about page.
        </p>
      </div>
    </div>
  );
}

// The Ask page: /task writes to the timeline in the same transaction, no
// model key involved. The reply text matches convex/ask.ts exactly.
function MockAsk() {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <p className="self-end rounded-md bg-raised px-3 py-2 font-mono text-[11px] text-white">
        /task recheck AuditBot on 9/15, email me
      </p>
      <div className="rounded-md border border-edge bg-ink px-3 py-2">
        <p className="text-xs leading-relaxed text-neutral-300">Task added to AuditBot.</p>
        <p className="mt-1.5 font-mono text-[10px] text-neutral-600">
          due Sep 15 &middot; email reminder set
        </p>
      </div>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
        {["/task", "/note", "search_web", "read_page"].map((chip) => (
          <span
            key={chip}
            className="rounded border border-edge bg-ink px-1.5 py-0.5 font-mono text-[10px] text-neutral-500"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

// Rechecks from the seeded deals, each with a day chip and the reason rule.
function MockFollowUps() {
  const items = [
    { label: "Recheck Paula Marchetti", days: "14d", active: true },
    { label: "Brief owner: Social Good renewal", days: "2d", active: false },
    { label: "Re-enrich Roo Capital fund ops", days: "90d", active: false },
  ];
  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="divide-y divide-edge rounded-md border border-edge bg-ink">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2.5 px-3 py-2">
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                item.active ? "bg-emerald-400" : "bg-neutral-600"
              }`}
            />
            <span className="truncate text-xs text-neutral-300">{item.label}</span>
            <span className="ml-auto font-mono text-[10px] text-neutral-500">{item.days}</span>
          </div>
        ))}
      </div>
      <div className="mt-auto pt-1">
        <MockLabel>Why</MockLabel>
        <p className="mt-1 text-xs leading-relaxed text-neutral-500">
          An agent that cannot say why it will be back in fourteen days does not have a reason, it
          has a default.
        </p>
      </div>
    </div>
  );
}

// Live function stream, like the Activity page and the Convex dashboard logs.
function MockActivityLog() {
  const lines = [
    { kind: "Q", name: "companies.list", detail: "12ms" },
    { kind: "M", name: "deals.moveStage", detail: "ok" },
    { kind: "A", name: "web.searchWeb", detail: "exa" },
    { kind: "A", name: "agents.run.enrich", detail: "4.2s" },
    { kind: "M", name: "slack.notify", detail: "#deals" },
    { kind: "M", name: "timeline.append", detail: "ok" },
  ];
  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-edge bg-ink p-3 font-mono text-[11px]">
      {lines.map((line, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-3 text-accent">{line.kind}</span>
          <span className="text-neutral-300">{line.name}</span>
          <span className="ml-auto text-neutral-600">{line.detail}</span>
        </div>
      ))}
    </div>
  );
}

// BYOK: the real env key for every optional provider, grouped by capability.
function MockByok() {
  const groups = [
    {
      label: "Chat",
      providers: [
        { name: "DeepSeek", envKey: "DEEPSEEK_API_KEY" },
        { name: "OpenAI", envKey: "OPENAI_API_KEY" },
        { name: "Claude", envKey: "ANTHROPIC_API_KEY" },
        { name: "OpenRouter", envKey: "OPENROUTER_API_KEY" },
        { name: "Grok", envKey: "GROK_API_KEY" },
      ],
    },
    {
      label: "Research",
      providers: [
        { name: "Context.dev", envKey: "CONTEXT_DEV_API_KEY" },
        { name: "Firecrawl", envKey: "FIRECRAWL_API_KEY" },
        { name: "Exa", envKey: "EXA_API_KEY" },
      ],
    },
    {
      label: "Email",
      providers: [
        { name: "Resend", envKey: "RESEND_API_KEY" },
        { name: "AgentMail", envKey: "AGENTMAIL_API_KEY" },
      ],
    },
  ];
  return (
    <div className="grid flex-1 gap-3 sm:grid-cols-3">
      {groups.map((group) => (
        <div key={group.label} className="rounded-md border border-edge bg-ink p-3">
          <MockLabel>{group.label}</MockLabel>
          <div className="mt-2 flex flex-col gap-2">
            {group.providers.map((p) => (
              <div key={p.name}>
                <p className="text-xs font-medium text-white">{p.name}</p>
                <p className="mt-0.5 truncate font-mono text-[10px] text-neutral-500">{p.envKey}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function WhatItDoes() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-14">
      <h2 className="text-2xl font-semibold text-white">What it actually does</h2>
      <p className="mt-2 max-w-2xl text-neutral-400">
        Durable agents read your pipeline, write back what they learn, and say why. Every block
        below is the real product, seeded data and all.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <BentoCard
          title="Agents that automate your CRM"
          body="Describe a process in a sentence and it becomes a draft agent with versioned instructions, on its own queue, on its own schedule. Definitions are data, deploying is a pointer move."
          className="sm:col-span-2"
        >
          <MockAgentBuilder />
        </BentoCard>
        <BentoCard
          title="Ask any record a question"
          body="The record chat reads your own history with the company and shows its working. No model key? It says so instead of pretending."
          className="sm:col-span-2 lg:col-span-1 lg:row-span-2"
        >
          <MockRecordChat />
        </BentoCard>
        <BentoCard
          title="Records fill themselves in"
          body="A new company with a domain gets its logo, industry, and description from Context.dev brand data, with the evidence recorded in the ledger."
          className="sm:col-span-2"
        >
          <MockCompanies />
        </BentoCard>
        <BentoCard
          title="Slack hears about it first"
          body="Deal moves post to your channel, and the /crm bot answers questions and works the board from inside Slack."
        >
          <MockSlack />
        </BentoCard>
        <BentoCard
          title="It reads the web for you"
          body="Agents search with Exa, scrape pages with Firecrawl, and file every fact with the source that backs it."
        >
          <MockWebResearch />
        </BentoCard>
        <BentoCard
          title="One chat runs the whole CRM"
          body="The Ask page answers from every table. /task and /note write straight to the timeline, no model key needed."
        >
          <MockAsk />
        </BentoCard>
        <BentoCard
          title="It books its own follow-ups"
          body="Rechecks require a stated reason before they land on the queue."
        >
          <MockFollowUps />
        </BentoCard>
        <BentoCard
          title="Watch it work"
          body="The Activity page streams every query, mutation, and agent run live. Command-K searches every record."
          className="sm:col-span-2"
        >
          <MockActivityLog />
        </BentoCard>
        <BentoCard
          title="Bring your own keys"
          body={
            <>
              Every integration is optional. Set a key and the capability turns on; leave it unset
              and the app says so instead of faking results.{" "}
              <TextLink
                to="/docs#environment-variables"
                variant="hover"
                className="whitespace-nowrap"
              >
                Every key explained
              </TextLink>
            </>
          }
          className="sm:col-span-2 lg:col-span-3"
        >
          <MockByok />
        </BentoCard>
      </div>
    </section>
  );
}

// Soft highlight for the config-relevant phrase in a demo note. The accent
// token remaps under html.light, so the tint stays subtle in both themes.
function Hl({ children }: { children: ReactNode }) {
  return (
    <span className="rounded bg-accent/10 px-1 py-px font-medium text-accent">{children}</span>
  );
}

// Same tint for environment variable names, in mono so they read as keys.
function EnvKey({ children }: { children: ReactNode }) {
  return (
    <span className="rounded bg-accent/10 px-1 py-px font-mono text-[0.8125rem] text-accent">
      {children}
    </span>
  );
}

// Inline link to the docs section that covers the note.
function DocsLink({ to, label }: { to: string; label: string }) {
  return (
    <TextLink to={to} variant="hover" className="whitespace-nowrap">
      {label}
    </TextLink>
  );
}

function DemoNotes() {
  const notes = [
    {
      key: "realtime",
      body: (
        <>
          Everything in the CRM <Hl>works in real time</Hl>: companies, contacts, the deal board,
          agents, and the dashboard rollups. Nothing to configure.{" "}
          <DocsLink to="/docs#using-the-app" label="Using the app" />
        </>
      ),
    },
    {
      key: "reset",
      body: (
        <>
          Content <Hl>resets every 10 minutes</Hl> with a Convex cron job. Edit anything; it comes
          back. Your fork can turn the reset off.{" "}
          <DocsLink to="/docs#fork-and-setup" label="Fork and set it up" />
        </>
      ),
    },
    {
      key: "auth",
      body: (
        <>
          Sign-in is disabled. The code ships <Hl>ready for Convex Auth</Hl>; the demo keeps writes
          open on seeded data instead. <DocsLink to="/docs#auth" label="Turning on sign-in" />
        </>
      ),
    },
    {
      key: "email",
      body: (
        <>
          Email is wired through the Resend and AgentMail components but not configured on the
          demo. Set <EnvKey>RESEND_API_KEY</EnvKey>, or <EnvKey>AGENTMAIL_API_KEY</EnvKey> plus{" "}
          <EnvKey>AGENTMAIL_INBOX_ID</EnvKey>, on your own deployment and pick a provider in
          Settings. <DocsLink to="/docs#email" label="Email setup" />
        </>
      ),
    },
    {
      key: "slack",
      body: (
        <>
          Slack notifications and the /crm bot are built in but off by default. Set{" "}
          <EnvKey>SLACK_WEBHOOK_URL</EnvKey> or <EnvKey>SLACK_BOT_TOKEN</EnvKey> and flip the
          switch in Settings, Slack. The demo never posts.{" "}
          <DocsLink to="/docs#slack" label="Slack setup" />
        </>
      ),
    },
    {
      key: "research",
      body: (
        <>
          Enrichment, web research, and chat degrade honestly: without{" "}
          <EnvKey>CONTEXT_DEV_API_KEY</EnvKey>, <EnvKey>FIRECRAWL_API_KEY</EnvKey>,{" "}
          <EnvKey>EXA_API_KEY</EnvKey>, or a model key they say so instead of faking results.{" "}
          <DocsLink to="/docs#web-research" label="Web research setup" />
        </>
      ),
    },
    {
      key: "providers",
      body: (
        <>
          Chat runs on DeepSeek (the default), OpenAI, Claude, OpenRouter, or Grok. None of those keys ship by default;{" "}
          <Hl>pick a provider in Settings</Hl> and set its key on your own deployment.{" "}
          <DocsLink to="/docs#ai-providers" label="AI providers" />
        </>
      ),
    },
  ];
  return (
    <section className="mx-auto max-w-3xl px-4 pb-14">
      <div className="rounded-lg border border-edge bg-panel p-6">
        <h2 className="text-base font-semibold text-white">What the demo does and does not do</h2>
        <ul className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-neutral-400">
          {notes.map((note) => (
            <li key={note.key} className="flex gap-2.5">
              <span
                aria-hidden
                className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-600"
              />
              <span>{note.body}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ForkIt() {
  return (
    <section className="border-t border-edge py-14 text-center">
      <h2 className="text-3xl font-semibold text-white">Fork it. It's yours.</h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-neutral-400">
        MIT licensed. One clone, one Convex deployment, no other services to stand up.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <CopyPromptButton />
        <a
          href="https://github.com/waynesutton/trycrm-convex"
          className="rounded-md bg-white/10 px-4 py-2 text-sm text-white transition-colors hover:bg-white/15">
          View on GitHub
        </a>
      </div>
    </section>
  );
}

// credit shows the built-with line on the homepage and Compare only; the
// Docs page renders the footer without it.
export function SiteFooter({ credit = false }: { credit?: boolean }) {
  return (
    <footer className="border-t border-edge py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 text-center">
        <div className="flex items-center gap-2.5">
          <img src="/convex-logo-white.png" alt="Convex" className="themed-logo h-4" />
          <span className="text-sm text-neutral-400">The open source agentic CRM, on Convex.</span>
        </div>
        {credit ? (
          <p className="text-xs text-neutral-600">
            Made with{" "}
            <a href="https://cursor.com" className="hover:text-neutral-400">
              Cursor
            </a>
            ,{" "}
            <a href="https://claude.com" className="hover:text-neutral-400">
              Claude Fable
            </a>{" "}
            and{" "}
            <a
              href="https://developers.cloudflare.com/dns/"
              className="hover:text-neutral-400"
            >
              DNS Cloudflare
            </a>
            .
          </p>
        ) : null}
        <div className="flex flex-wrap justify-center gap-4 text-xs text-neutral-500">
          <Link to="/docs" className="hover:text-neutral-300">
            Docs
          </Link>
          <a href="https://github.com/waynesutton/trycrm-convex" className="hover:text-neutral-300">
            GitHub
          </a>
          <a
            href="https://github.com/waynesutton/trycrm-convex/issues"
            className="hover:text-neutral-300">
            File an issue
          </a>
          <a href="https://github.com/trycompai/crm" className="hover:text-neutral-300">
            Original by Comp AI
          </a>
          <a href="https://convex.dev" className="hover:text-neutral-300">
            Convex
          </a>
          <a href="https://www.convex.dev/components" className="hover:text-neutral-300">
            Components
          </a>
        </div>
      </div>
    </footer>
  );
}
