import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SiteFooter, SiteHeader } from "./Landing";

// The full setup and usage guide. Written for someone who has never deployed
// a backend before: every command is shown, every key is explained, and every
// optional feature says what happens when its key is missing.

const SECTIONS = [
  { id: "what-this-is", label: "What this is" },
  { id: "using-the-app", label: "Using the app" },
  { id: "fork-and-setup", label: "Fork and set it up" },
  { id: "environment-variables", label: "Environment variables" },
  { id: "email", label: "Email: Resend and AgentMail" },
  { id: "email-dns", label: "Email DNS with Cloudflare" },
  { id: "slack", label: "Slack: notifications and the bot" },
  { id: "web-research", label: "Web research: Firecrawl, Exa, Context.dev" },
  { id: "ai-providers", label: "AI providers: OpenAI, Claude, OpenRouter" },
  { id: "auth", label: "Turning on sign-in" },
  { id: "deploy", label: "Deploying to production" },
  { id: "custom-domain", label: "Custom domain with Cloudflare" },
  { id: "coding-agents", label: "Using Cursor, Codex, or other tools" },
  { id: "components", label: "Every component in this app" },
  { id: "resources", label: "Resources" },
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-edge py-10">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="mt-4 flex flex-col gap-4 text-sm leading-relaxed text-neutral-400">
        {children}
      </div>
    </section>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-md border border-edge bg-panel px-4 py-3 font-mono text-[13px] leading-relaxed text-neutral-200">
      {children}
    </pre>
  );
}

function K({ children }: { children: string }) {
  return (
    <code className="rounded bg-raised px-1.5 py-0.5 font-mono text-[12px] text-neutral-200">
      {children}
    </code>
  );
}

const LINK_CLASS =
  "text-accent underline decoration-edge underline-offset-2 hover:decoration-accent";

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className={LINK_CLASS}>
      {children}
    </a>
  );
}

const ENV_ROWS: Array<{
  name: string;
  required: string;
  enables: string;
  where: string;
}> = [
  {
    name: "CONTEXT_DEV_API_KEY",
    required: "Yes, but “unset” works",
    enables:
      "Brand enrichment on company records, plus web search and page reading for the chat agent when Exa or Firecrawl keys are missing",
    where: "context.dev",
  },
  {
    name: "FIRECRAWL_API_KEY",
    required: "Yes, but “unset” works",
    enables:
      "The chat agent reads any web page as markdown. Context.dev covers this when only its key is set",
    where: "firecrawl.dev",
  },
  {
    name: "EXA_API_KEY",
    required: "Yes, but “unset” works",
    enables:
      "The chat agent searches the web semantically. Context.dev covers this when only its key is set",
    where: "exa.ai",
  },
  {
    name: "OPENAI_API_KEY",
    required: "No",
    enables: "Chat and agent reasoning when OpenAI is the selected provider",
    where: "platform.openai.com",
  },
  {
    name: "ANTHROPIC_API_KEY",
    required: "No",
    enables: "Chat and agent reasoning when Claude is the selected provider",
    where: "console.anthropic.com",
  },
  {
    name: "OPENROUTER_API_KEY",
    required: "No",
    enables: "Chat and agent reasoning when OpenRouter is the selected provider",
    where: "openrouter.ai",
  },
  {
    name: "RESEND_API_KEY",
    required: "No",
    enables: "Outbound email notifications through Resend",
    where: "resend.com",
  },
  {
    name: "AGENTMAIL_API_KEY",
    required: "No",
    enables: "Outbound email plus a persistent inbox through AgentMail",
    where: "agentmail.to",
  },
  {
    name: "AGENTMAIL_INBOX_ID",
    required: "Only with AgentMail",
    enables: "Tells AgentMail which inbox to send from",
    where: "AgentMail dashboard",
  },
  {
    name: "SLACK_WEBHOOK_URL",
    required: "No",
    enables:
      "Slack notifications in simple mode: posts to one fixed channel through an incoming webhook",
    where: "api.slack.com/apps, Incoming Webhooks",
  },
  {
    name: "SLACK_BOT_TOKEN",
    required: "No",
    enables:
      "Slack notifications in full mode: the channel picker in Settings and the /crm bot. Starts with xoxb-",
    where: "api.slack.com/apps, OAuth & Permissions",
  },
  {
    name: "SLACK_SIGNING_SECRET",
    required: "Only for the /crm bot",
    enables: "Verifies inbound Slack slash commands and interactions",
    where: "api.slack.com/apps, Basic Information",
  },
  {
    name: "APP_URL",
    required: "No",
    enables:
      "Overrides the base URL used in Slack deep links, for custom domains",
    where: "your own domain",
  },
  {
    name: "FIRECRAWL_WEBHOOK_SECRET",
    required: "No",
    enables: "Verifies Firecrawl crawl webhooks in production",
    where: "firecrawl.dev dashboard",
  },
  {
    name: "AGENTMAIL_WEBHOOK_SECRET",
    required: "No",
    enables: "Verifies inbound AgentMail webhooks",
    where: "AgentMail dashboard",
  },
];

export function Docs() {
  // Links like /docs#email arrive via client-side navigation, where the
  // browser does not scroll to the anchor on its own.
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  // Sidebar search: filters the section list by title, and by the actual
  // body text of each rendered section, so "not_in_channel" finds the
  // Slack section even though the label never says it.
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const visibleSections =
    query === ""
      ? SECTIONS
      : SECTIONS.filter((section) => {
          if (section.label.toLowerCase().includes(query)) return true;
          const body = document.getElementById(section.id)?.textContent ?? "";
          return body.toLowerCase().includes(query);
        });

  // The sidebar highlights the section under the reading line as you
  // scroll, the way documentation sites do it.
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );
    for (const section of SECTIONS) {
      const node = document.getElementById(section.id);
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-ink text-neutral-200">
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl gap-10 px-4 py-12">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="sticky top-20 flex flex-col gap-0.5">
            <p className="mb-2 px-2.5 text-xs font-semibold text-neutral-500">
              Docs
            </p>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setSearch("");
              }}
              placeholder="Search docs"
              aria-label="Search docs"
              className="mb-2 w-full rounded-md border border-edge bg-panel px-2.5 py-1.5 text-[13px] text-white placeholder:text-neutral-600 focus:border-accent focus:outline-none"
            />
            {visibleSections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`rounded-md px-2.5 py-1.5 text-[13px] leading-snug transition-colors ${
                  activeId === section.id
                    ? "bg-raised text-white"
                    : "text-neutral-500 hover:text-white"
                }`}
              >
                {section.label}
              </a>
            ))}
            {visibleSections.length === 0 ? (
              <p className="px-2.5 py-1.5 text-xs text-neutral-600">
                No sections match.
              </p>
            ) : null}
            <a
              href="https://github.com/waynesutton/trycrm-convex/issues"
              className="mt-2 border-t border-edge px-2.5 pt-3 text-[13px] text-neutral-500 transition-colors hover:text-white"
            >
              File an issue
            </a>
          </nav>
        </aside>

        <div className="min-w-0 max-w-3xl flex-1">
        <h1 className="text-3xl font-semibold text-white">Docs</h1>
        <p className="mt-3 max-w-2xl text-neutral-500">
          Everything you need to run this CRM yourself: how the app works, how
          to fork and deploy it on Convex, which API keys do what, and how to
          turn on the optional features. Written for people who have never
          deployed a backend before.
        </p>

        <nav className="mt-8 rounded-lg border border-edge bg-panel p-5 md:hidden">
          <p className="text-xs font-semibold text-neutral-500">
            On this page
          </p>
          <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-neutral-400 hover:text-white"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-6">
          <Section id="what-this-is" title="What this is">
            <p>
              This is{" "}
              <Ext href="https://github.com/trycompai/crm">trycompai/crm</Ext>,
              the open source agentic CRM by Comp AI, ported to run entirely on{" "}
              <Ext href="https://convex.dev">Convex</Ext>. The original runs on
              Next.js, Postgres, Redis, and Vercel. This version runs on one
              Convex deployment: the database, the agent runtime, the work
              queue, the cron scheduler, file storage, and the website itself
              all live in the same place.
            </p>
            <p>
              The code is MIT licensed and lives at{" "}
              <Ext href="https://github.com/waynesutton/trycrm-convex">
                github.com/waynesutton/trycrm-convex
              </Ext>
              . The live demo resets its content every 10 minutes, so feel free
              to change anything.
            </p>
          </Section>

          <Section id="using-the-app" title="Using the app">
            <p>
              Open <Link to="/app" className={LINK_CLASS}>the demo</Link>{" "}
              and you land on the dashboard. Here is what each section does.
            </p>
            <ul className="flex list-disc flex-col gap-2 pl-5">
              <li>
                <span className="text-white">Dashboard.</span> Pipeline totals
                by stage, recent activity, and agent run counts. The numbers
                come from the aggregate component, so they update the moment
                anything changes, in every open browser tab.
              </li>
              <li>
                <span className="text-white">Companies.</span> Add a company
                with a domain and enrichment kicks in: an agent task fetches
                the logo, industry, and description from Context.dev brand
                data and logs the observation on the company timeline.
              </li>
              <li>
                <span className="text-white">Contacts.</span> People, linked
                to companies. Nothing about a person is guessed. Every field
                shows the evidence it came from, like a signature block or a
                thread reply, and blank fields stay blank.
              </li>
              <li>
                <span className="text-white">Deals.</span> A board grouped by
                stage. Drag a card between columns, use the stage menu, or
                switch to the sortable list view. Totals convert to the
                workspace reporting currency.
              </li>
              <li>
                <span className="text-white">Ask.</span> A workspace chat over
                the whole CRM. Replies stream in as they generate. Type{" "}
                <K>/</K> for slash commands: web search, page reading,
                CRM-only answers, and <K>/task</K> or <K>/note</K>, which
                write straight to a record timeline with no AI key needed.
                Mention a company or contact by name and the command links the
                record; phrases like "in 3 days", "tomorrow", or "on Aug 15"
                set the due date, and "email me" schedules a reminder through
                the configured email provider at the due time. Past chats live
                in a sub-sidebar with archive and delete.
              </li>
              <li>
                <span className="text-white">Notes and tasks.</span> Every
                company and contact page has a composer that logs notes or
                creates tasks with a due date, set as "in N days" or picked
                from a calendar, an optional email reminder, and a Complete
                button. Timeline writes also land on the Activity page, so
                both views tell one story.
              </li>
              <li>
                <span className="text-white">Compose email.</span> The Email
                button on company and contact pages opens a floating compose
                window: To, Cc, Bcc, markdown with preview, attachments, drag
                and resize. Sending waits for a Resend or AgentMail key; the
                timeline records the email either way. Details in the{" "}
                <a
                  href="#email"
                  className={LINK_CLASS}
                >
                  email section
                </a>
                .
              </li>
              <li>
                <span className="text-white">Activity.</span> A live log of
                function outcomes, in the shape of the Convex dashboard logs.
                Pause freezes the view, checkboxes select one row or all of
                them for a targeted clear, Clear wipes everything, and the
                demo reset wipes it every 10 minutes anyway.
              </li>
              <li>
                <span className="text-white">Command-K.</span> Press{" "}
                <K>⌘K</K> (or <K>Ctrl-K</K>) anywhere in the app, or click
                Search in the sidebar, to jump to any company, contact, or
                deal. In the demo it searches only the CRM data.
              </li>
              <li>
                <span className="text-white">Sidebar.</span> Drag items to
                reorder them. Hide items you do not use from Settings. The
                rail icon in the header (or <K>⌘.</K>) collapses the sidebar
                entirely, and that preference sticks per browser. Order and
                visibility store on the workspace and reset with the demo.
              </li>
              <li>
                <span className="text-white">Keyboard shortcuts.</span> Press{" "}
                <K>⌘?</K> or click the keyboard icon in the sidebar footer to
                see every shortcut: search, sidebar toggle, and the Ask
                composer keys.
              </li>
              <li>
                <span className="text-white">Agents.</span> The list of
                research agents, their queues, and their run history. Describe
                a new process in plain language and the agent-builder drafts a
                new agent with versioned instructions.
              </li>
              <li>
                <span className="text-white">Record chat.</span> Open any
                company or contact and ask it a question. The agent reads your
                own CRM history first, and can search the web or read a page
                when a Firecrawl, Exa, or Context.dev key is set. Without
                keys it tells you which key enables what instead of making
                something up.
              </li>
              <li>
                <span className="text-white">Settings.</span> Split into
                pages with its own sub-sidebar: Team, Integrations (with the
                API key how-to), Email (provider, from identity, signature),
                AI provider, Sidebar visibility, and Custom fields.
              </li>
            </ul>
          </Section>

          <Section id="fork-and-setup" title="Fork and set it up">
            <p>
              You need two free accounts:{" "}
              <Ext href="https://github.com">GitHub</Ext> and{" "}
              <Ext href="https://convex.dev">Convex</Ext>. You also need{" "}
              <Ext href="https://nodejs.org">Node.js</Ext> version 20 or newer
              on your computer. That is it. There is no database to create and
              no server to rent.
            </p>
            <p>
              <span className="text-white">Step 1.</span> Fork the repo. On{" "}
              <Ext href="https://github.com/waynesutton/trycrm-convex">
                the GitHub page
              </Ext>{" "}
              click Fork, then clone your fork to your computer:
            </p>
            <Code>{`git clone https://github.com/YOUR-USERNAME/trycrm-convex.git
cd trycrm-convex
npm install`}</Code>
            <p>
              <span className="text-white">Step 2.</span> Create your Convex
              deployment. This one command signs you in, creates a free dev
              deployment, and starts syncing the backend code:
            </p>
            <Code>{`npx convex dev`}</Code>
            <p>
              The first run will pause and ask for three required environment
              variables. Set each one to the literal word{" "}
              <K>unset</K> for now. That is a real value the app understands:
              it means run without this vendor and say so in the UI.
            </p>
            <Code>{`npx convex env set CONTEXT_DEV_API_KEY unset
npx convex env set FIRECRAWL_API_KEY unset
npx convex env set EXA_API_KEY unset`}</Code>
            <p>
              These set your dev deployment only. Production keeps its own
              variables; the deploy section below repeats these commands
              with <K>--prod</K>.
            </p>
            <p>
              <span className="text-white">Step 3.</span> Run the app locally.
              In a second terminal:
            </p>
            <Code>{`npm run dev`}</Code>
            <p>
              This starts Vite on localhost and keeps <K>convex dev</K>{" "}
              watching your backend files. Open the printed localhost URL. The
              first visit seeds the demo data automatically.
            </p>
            <p>
              Everything works at this point. Enrichment, web research, chat,
              and email will each show a note explaining which key turns them
              on. Add keys whenever you want; no restart needed.
            </p>
          </Section>

          <Section id="environment-variables" title="Environment variables">
            <p>
              Environment variables are how you give the deployment your API
              keys. They live on the Convex deployment, not in a file in the
              repo, so they never end up in git. Set them from the terminal:
            </p>
            <Code>{`npx convex env set OPENAI_API_KEY sk-...`}</Code>
            <p>
              Or in the{" "}
              <Ext href="https://dashboard.convex.dev">Convex dashboard</Ext>:
              open your project, pick the deployment, then Settings, then
              Environment Variables. Dev and production deployments have
              separate variables, so remember to set keys on both. To set a
              variable on production from the terminal, add <K>--prod</K>:
            </p>
            <Code>{`npx convex env set OPENAI_API_KEY sk-... --prod`}</Code>
            <div className="overflow-x-auto rounded-lg border border-edge">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-edge bg-panel text-xs text-neutral-500">
                    <th className="px-3 py-2 font-medium">Variable</th>
                    <th className="px-3 py-2 font-medium">Required</th>
                    <th className="px-3 py-2 font-medium">What it enables</th>
                    <th className="px-3 py-2 font-medium">Get a key at</th>
                  </tr>
                </thead>
                <tbody>
                  {ENV_ROWS.map((row) => (
                    <tr
                      key={row.name}
                      className="border-b border-edge/60 align-top last:border-0"
                    >
                      <td className="px-3 py-2 font-mono text-[12px] text-neutral-200">
                        {row.name}
                      </td>
                      <td className="px-3 py-2 text-neutral-500">
                        {row.required}
                      </td>
                      <td className="px-3 py-2 text-neutral-400">
                        {row.enables}
                      </td>
                      <td className="px-3 py-2 text-neutral-500">
                        {row.where}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              The three “required” keys accept the sentinel value{" "}
              <K>unset</K>. The deploy needs the variable to exist because the
              components declare it, but the app checks for the sentinel and
              skips the vendor call. Replace <K>unset</K> with a real key any
              time and the feature switches on immediately.
            </p>
          </Section>

          <Section id="email" title="Email: Resend and AgentMail">
            <p>
              Email does two jobs here. Agents send notification emails when
              they finish meaningful work, and you can write your own: every
              company and contact page has an Email button that opens a
              compose window. Two providers are wired in and you pick one in
              Settings. Both are off until you add keys, and the app logs
              what it would have sent instead of failing.
            </p>
            <ul className="flex list-disc flex-col gap-2 pl-5">
              <li>
                <span className="text-white">Resend</span> is plain outbound
                email. Set <K>RESEND_API_KEY</K> and you are done. The{" "}
                <Ext href="https://www.convex.dev/components/resend">
                  Resend component
                </Ext>{" "}
                handles batching, retries, and delivery status.
              </li>
              <li>
                <span className="text-white">AgentMail</span> gives agents a
                real inbox: sent mail, received mail, threads, and labels all
                sync into your Convex database. Set{" "}
                <K>AGENTMAIL_API_KEY</K> and <K>AGENTMAIL_INBOX_ID</K>. To
                receive inbound mail, register the webhook URL{" "}
                <K>{`https://YOUR-DEPLOYMENT.convex.site/agentmail/webhook`}</K>{" "}
                in the{" "}
                <Ext href="https://agentmail.to">AgentMail dashboard</Ext> and
                set <K>AGENTMAIL_WEBHOOK_SECRET</K>.
              </li>
            </ul>
            <p>
              Set keys from the terminal. Production keeps its own copies,
              so run each command again with <K>--prod</K> if you deployed:
            </p>
            <Code>{`npx convex env set RESEND_API_KEY re_...
npx convex env set RESEND_API_KEY re_... --prod  # production`}</Code>
            <p>
              The toggle lives in Settings under Email. It stores one field
              on the workspace row, so switching is instant and applies to
              every message sent afterward. You can keep keys for both
              configured and flip between them freely.
            </p>
            <p>
              <span className="text-white">Composing.</span> The compose
              window supports To, Cc, Bcc, markdown in the body with a live
              preview, and file attachments. It floats over the page, drags
              by its title bar, and resizes from the corner. Attachments
              upload to Convex file storage and arrive as download links in
              the message, which behaves the same on both providers. Every
              composed email lands on the record timeline and the Activity
              page the moment you hit Send, even on installs with no keys;
              only the actual delivery waits for a configured provider, and
              the Send button explains that instead of failing.
            </p>
            <p>
              <span className="text-white">From identity and signature.</span>{" "}
              Settings, then Email, has a Compose defaults panel: a from
              name, a from address, and a default signature that appends to
              every message. With Resend the from address must belong to a{" "}
              <Ext href="https://resend.com/docs/dashboard/domains/introduction">
                domain you verified in Resend
              </Ext>
              . AgentMail always sends from your inbox address, so the from
              fields apply to Resend only.
            </p>
          </Section>

          <Section id="email-dns" title="Email DNS with Cloudflare">
            <p>
              Sending email from <K>you@yourdomain.com</K> needs DNS records
              that prove your provider is allowed to send for your domain.
              Three record types do that job: SPF lists the servers allowed
              to send, DKIM signs each message so receivers can check it was
              not altered, and DMARC tells receivers what to do when a check
              fails. Both providers hand you the exact values to paste, so
              this is copy and paste work. The Cloudflare reference is{" "}
              <Ext href="https://developers.cloudflare.com/dns/manage-dns-records/how-to/email-records/">
                set up email records
              </Ext>
              .
            </p>
            <p>Two rules apply to every record on this page:</p>
            <ul className="flex list-disc flex-col gap-2 pl-5">
              <li>
                <span className="text-white">Everything is DNS only.</span>{" "}
                Every email record goes into Cloudflare with the grey cloud,
                never Proxied. A proxied record hides the real value from
                mail servers and verification fails.
              </li>
              <li>
                <span className="text-white">One SPF record per name.</span>{" "}
                If a name already has an SPF TXT record, merge the new{" "}
                <K>include:</K> into it instead of adding a second record.
                Two SPF records on one name break both.
              </li>
            </ul>
            <p>
              Both providers recommend a sending subdomain, like{" "}
              <K>send.yourdomain.com</K>, instead of the root domain. It
              keeps your root MX records free for regular mail and separates
              sending reputation. Using a different subdomain per provider
              also means their SPF records never touch each other.
            </p>
            <p>
              <span className="text-white">Resend, the fast path.</span> On
              the{" "}
              <Ext href="https://resend.com/domains">Resend domains page</Ext>
              , add your domain, then click Sign in to Cloudflare. This uses
              Domain Connect to write the records into your zone for you.
              Authorize it, wait a few minutes, done. If that works you can
              skip the manual table below.
            </p>
            <p>
              <span className="text-white">Resend, the manual path.</span>{" "}
              Add the domain in Resend, then copy each record it shows into
              Cloudflare under DNS, Records. The values are unique per
              domain; these are the shapes to expect:
            </p>
            <div className="overflow-x-auto rounded-lg border border-edge">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-edge bg-panel text-xs text-neutral-500">
                    <th className="px-3 py-2 font-medium">Type</th>
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Content</th>
                    <th className="px-3 py-2 font-medium">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-edge/60 align-top">
                    <td className="px-3 py-2 font-mono text-[12px] text-neutral-200">
                      MX
                    </td>
                    <td className="px-3 py-2 font-mono text-[12px] text-neutral-200">
                      send
                    </td>
                    <td className="px-3 py-2 font-mono text-[12px] text-neutral-400">
                      feedback-smtp.us-east-1.amazonses.com
                    </td>
                    <td className="px-3 py-2 text-neutral-500">10</td>
                  </tr>
                  <tr className="border-b border-edge/60 align-top">
                    <td className="px-3 py-2 font-mono text-[12px] text-neutral-200">
                      TXT
                    </td>
                    <td className="px-3 py-2 font-mono text-[12px] text-neutral-200">
                      send
                    </td>
                    <td className="px-3 py-2 font-mono text-[12px] text-neutral-400">
                      "v=spf1 include:amazonses.com ~all"
                    </td>
                    <td className="px-3 py-2 text-neutral-500">n/a</td>
                  </tr>
                  <tr className="align-top">
                    <td className="px-3 py-2 font-mono text-[12px] text-neutral-200">
                      TXT
                    </td>
                    <td className="px-3 py-2 font-mono text-[12px] text-neutral-200">
                      resend._domainkey
                    </td>
                    <td className="px-3 py-2 font-mono text-[12px] text-neutral-400">
                      p=... (DKIM key from Resend)
                    </td>
                    <td className="px-3 py-2 text-neutral-500">n/a</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Type only the name part in Cloudflare; it appends your domain
              on its own, so <K>send</K> becomes{" "}
              <K>send.yourdomain.com</K>. Then click Verify DNS Records back
              in Resend. Verification usually lands in minutes. Full guide:{" "}
              <Ext href="https://resend.com/docs/knowledge-base/cloudflare">
                Resend on Cloudflare
              </Ext>
              . Once verified, set the key and pick a from address on that
              domain in Settings, Email:
            </p>
            <Code>{`npx convex env set RESEND_API_KEY re_...
npx convex env set RESEND_API_KEY re_... --prod  # production`}</Code>
            <p>
              To also receive mail through Resend, toggle Receiving on the
              domain page and add the inbound MX record it shows, on a
              subdomain, so it never competes with your regular mail.
            </p>
            <p>
              <span className="text-white">AgentMail.</span> No DNS needed to
              start: every inbox gets an address on <K>agentmail.to</K>, so{" "}
              <K>AGENTMAIL_API_KEY</K> and <K>AGENTMAIL_INBOX_ID</K> are
              enough to send today. A custom domain is only for a branded
              from address. In the{" "}
              <Ext href="https://console.agentmail.to">AgentMail console</Ext>
              , open Domains, click Add Domain, and it returns the exact
              records for your domain: an SPF TXT record (
              <K>v=spf1 include:agentmail.to ~all</K>), a DKIM selector TXT
              record, a DMARC TXT record, and an MX record you only need if
              the inbox should receive mail on your domain. Add each one in
              Cloudflare as DNS only, then verify in the console. Guides:{" "}
              <Ext href="https://www.agentmail.to/docs/knowledge-base/custom-domain-setup">
                custom domain setup
              </Ext>{" "}
              and{" "}
              <Ext href="https://www.agentmail.to/docs/knowledge-base/spf-dkim-dmarc">
                SPF, DKIM, and DMARC
              </Ext>
              .
            </p>
            <p>
              Inbound mail for AgentMail arrives through the webhook covered
              in the{" "}
              <a
                href="#email"
                className={LINK_CLASS}
              >
                email section
              </a>
              : register{" "}
              <K>{`https://YOUR-DEPLOYMENT.convex.site/agentmail/webhook`}</K>{" "}
              in the AgentMail dashboard, or the same path on your custom
              domain once it is set up.
            </p>
          </Section>

          <Section id="slack" title="Slack: notifications and the bot">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-[13px] leading-relaxed text-amber-200/90">
              <span className="font-medium">Untested.</span> This integration
              was built against Slack's current API docs but has not been run
              against a live Slack workspace yet. The Activity page logs every
              send, skip, and failure, so start there if something misbehaves,
              and open a GitHub issue if you hit a bug.
            </div>
            <p>
              The CRM can post to Slack when things happen: a company or
              contact is created, a deal moves stage, a task completes, or
              an agent finishes a run. There is also an optional{" "}
              <K>/crm</K> slash command for working records from inside
              Slack. Everything is off by default. A fork with no Slack
              setup runs exactly like before; sends log as no-ops on the
              Activity page, the same way email behaves without keys.
            </p>
            <p>
              Turn it on in Settings, then Slack: flip the master switch,
              pick which events post, and connect one of two modes. Dev and
              production deployments keep separate environment variables, so
              every <K>env set</K> command below runs twice if you deployed:
              once as shown for dev, once with <K>--prod</K> for production.
            </p>
            <p>
              <span className="text-white">
                Simple mode: incoming webhook.
              </span>{" "}
              Fastest path, one env var, posts to one fixed channel. Create
              a Slack app at{" "}
              <Ext href="https://api.slack.com/apps">api.slack.com/apps</Ext>{" "}
              (From scratch, pick your workspace), open{" "}
              <span className="text-white">Incoming Webhooks</span>, switch
              it on, click{" "}
              <span className="text-white">Add New Webhook to Workspace</span>
              , and pick the channel. Slack gives you a URL starting with{" "}
              <K>https://hooks.slack.com/services/</K>. Set it:
            </p>
            <Code>{`npx convex env set SLACK_WEBHOOK_URL https://hooks.slack.com/services/...
npx convex env set SLACK_WEBHOOK_URL https://hooks.slack.com/services/... --prod  # production`}</Code>
            <p>
              That is the whole setup. The channel picker in Settings is
              ignored in this mode because the webhook URL already encodes
              the channel. Full webhook docs:{" "}
              <Ext href="https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks/">
                sending messages using incoming webhooks
              </Ext>
              .
            </p>
            <p>
              <span className="text-white">Full mode: bot token.</span> Lets
              you pick the channel from Settings and enables the{" "}
              <K>/crm</K> bot. In the same Slack app, open{" "}
              <span className="text-white">OAuth &amp; Permissions</span> and
              add these Bot Token Scopes: <K>chat:write</K> to post,{" "}
              <K>channels:read</K> to list public channels for the picker,{" "}
              <K>groups:read</K> if you want private channels in the picker,
              and <K>users:read</K> plus <K>users:read.email</K> so the bot
              can verify who is typing commands. Click{" "}
              <span className="text-white">Install to Workspace</span>, copy
              the Bot User OAuth Token (starts with <K>xoxb-</K>), and set
              it:
            </p>
            <Code>{`npx convex env set SLACK_BOT_TOKEN xoxb-...
npx convex env set SLACK_BOT_TOKEN xoxb-... --prod  # production`}</Code>
            <p>
              Back in Settings, Slack, click{" "}
              <span className="text-white">Load channels</span>, search, and
              pick one. Then invite the bot to that channel in Slack:
              type <K>/invite @your-bot-name</K> in the channel. Skipping
              the invite is the most common failure; Slack rejects the post
              with <K>not_in_channel</K>. Hit{" "}
              <span className="text-white">Send test message</span> to
              confirm the pipe works end to end. Scope reference:{" "}
              <Ext href="https://docs.slack.dev/reference/scopes">
                Slack permission scopes
              </Ext>
              .
            </p>
            <p>
              <span className="text-white">The /crm bot.</span> With a bot
              token in place, two more steps turn on the slash command.
              First set the signing secret, found under{" "}
              <span className="text-white">Basic Information</span>, App
              Credentials, in your Slack app:
            </p>
            <Code>{`npx convex env set SLACK_SIGNING_SECRET your-signing-secret
npx convex env set SLACK_SIGNING_SECRET your-signing-secret --prod  # production`}</Code>
            <p>
              Then create the command under{" "}
              <span className="text-white">Slash Commands</span>: command{" "}
              <K>/crm</K>, request URL{" "}
              <K>{`https://YOUR-DEPLOYMENT.convex.site/webhooks/slack/commands`}</K>
              , and a short description. Your deployment name is in the
              Convex dashboard; it is the <K>.convex.site</K> domain, not{" "}
              <K>.convex.cloud</K>. Finally flip the /crm bot switch in
              Settings, Slack. Commands:
            </p>
            <Code>{`/crm find Acme            look up a company, contact, or deal
/crm deal Acme won        move a deal to a stage (/crm stages lists them)
/crm note Acme "Called them, demo booked"
/crm task Acme "Send the proposal by Friday"
/crm activity Acme        the last ten timeline entries
/crm help`}</Code>
            <p>
              Every inbound request is verified with Slack's signed secrets
              scheme (
              <Ext href="https://docs.slack.dev/authentication/verifying-requests-from-slack/">
                verifying requests from Slack
              </Ext>
              ) and only workspace members can act: the bot matches the
              Slack profile email against the Team list in Settings, or an
              allowed email domain you set. Writes from Slack show up on
              the record timeline and Activity page attributed as{" "}
              <K>Name (Slack)</K>. Demo mode stays read only from Slack.
            </p>
            <p>
              <span className="text-white">Deep links.</span> Messages
              include an “Open in CRM” link back to the record.
              By default it points at your deployment's{" "}
              <K>.convex.site</K> URL; if you serve the app from a custom
              domain, set <K>APP_URL</K> to that origin.
            </p>
            <p>
              <span className="text-white">Troubleshooting.</span>{" "}
              <K>not_in_channel</K> means invite the bot with{" "}
              <K>/invite</K>. <K>invalid_auth</K> means the token is wrong
              or was revoked; reinstall the app and set the new token.{" "}
              <K>missing_scope</K> names the scope to add under OAuth &amp;
              Permissions (re-install the app after adding scopes). A 401
              on slash commands means the signing secret does not match.
              Rate limited posts retry automatically with backoff through
              the{" "}
              <Ext href="https://www.convex.dev/components/retrier">
                action retrier component
              </Ext>
              . Every send, skip, and failure is logged on the Activity
              page, so start there.
            </p>
          </Section>

          <Section
            id="web-research"
            title="Web research: Firecrawl, Exa, and Context.dev"
          >
            <p>
              Record chat has two research tools beyond your own CRM history:
              read a page and search the web. Each tool has two providers,
              and any one real key turns its tool on.
            </p>
            <ul className="flex list-disc flex-col gap-2 pl-5">
              <li>
                <span className="text-white">Reading pages.</span> Ask the
                chat to “read their pricing page” and the agent
                fetches the main content as markdown through the{" "}
                <Ext href="https://www.convex.dev/components/firecrawl/firecrawl-convex">
                  Firecrawl component
                </Ext>{" "}
                when <K>FIRECRAWL_API_KEY</K> is real, or the{" "}
                <Ext href="https://www.convex.dev/components/context-dot-dev/convex">
                  Context.dev component
                </Ext>{" "}
                when only <K>CONTEXT_DEV_API_KEY</K> is. Firecrawl results
                are cached for an hour so repeated questions do not spend
                credits.
              </li>
              <li>
                <span className="text-white">Searching the web.</span> Ask
                “what has this company shipped lately” and the
                agent searches through the{" "}
                <Ext href="https://www.convex.dev/components/exalabs/convex-exa">
                  Exa component
                </Ext>{" "}
                when <K>EXA_API_KEY</K> is real, or Context.dev when only its
                key is, citing titles and URLs in its answer.
              </li>
            </ul>
            <p>
              With both keys set for a tool, the named provider leads and
              Context.dev covers a failed call. The same{" "}
              <K>CONTEXT_DEV_API_KEY</K> that powers brand enrichment powers
              both research tools, so one key gives the agent the full
              research kit.
            </p>
            <p>
              Without any key, the tools return a plain “not
              configured” note and the agent repeats it to you, naming
              the keys that turn the feature on. Nothing is faked.
            </p>
            <p>
              A real key replaces the <K>unset</K> sentinel with the same
              command, and production needs its own copy with <K>--prod</K>:
            </p>
            <Code>{`npx convex env set EXA_API_KEY your-key
npx convex env set EXA_API_KEY your-key --prod  # production`}</Code>
          </Section>

          <Section
            id="ai-providers"
            title="AI providers: OpenAI, Claude, OpenRouter"
          >
            <p>
              The Ask page and record chat run on one model provider at a
              time, picked in Settings. None of the three keys ship by
              default: a fresh fork has no AI keys at all, and the chat
              answers with the exact key it needs instead of erroring. Set
              whichever one you use:
            </p>
            <Code>{`npx convex env set OPENAI_API_KEY sk-...
npx convex env set ANTHROPIC_API_KEY sk-ant-...
npx convex env set OPENROUTER_API_KEY sk-or-...`}</Code>
            <p>
              Production keeps separate variables, so run the same command
              with <K>--prod</K> when you deploy:
            </p>
            <Code>{`npx convex env set OPENAI_API_KEY sk-... --prod`}</Code>
            <ul className="flex list-disc flex-col gap-2 pl-5">
              <li>
                <span className="text-white">OpenAI</span> is the default,
                running <K>gpt-5-mini</K>. Get a key at{" "}
                <Ext href="https://platform.openai.com">
                  platform.openai.com
                </Ext>
                .
              </li>
              <li>
                <span className="text-white">Claude</span> runs{" "}
                <K>claude-sonnet-4-5</K> through Anthropic's API. Get a key at{" "}
                <Ext href="https://console.anthropic.com">
                  console.anthropic.com
                </Ext>
                .
              </li>
              <li>
                <span className="text-white">OpenRouter</span> routes through{" "}
                <Ext href="https://openrouter.ai">openrouter.ai</Ext>, which
                fronts many models with one key. It speaks the OpenAI wire
                format, so no extra dependency was needed.
              </li>
            </ul>
            <p>
              Switching providers in Settings takes effect on the next
              message. You can keep keys for all three set and flip freely.
            </p>
          </Section>

          <Section id="auth" title="Turning on sign-in">
            <p>
              The demo keeps sign-in off on purpose: anyone can try it and a
              cron resets the content every 10 minutes. Your fork will
              probably want real accounts. Start with the{" "}
              <Ext href="https://docs.convex.dev/auth/overview">
                Convex authentication overview
              </Ext>
              : Convex works with most auth providers because it verifies
              standard OpenID Connect JWTs, so you can bring{" "}
              <Ext href="https://docs.convex.dev/auth/clerk">Clerk</Ext>,{" "}
              <Ext href="https://docs.convex.dev/auth/authkit/">
                WorkOS AuthKit
              </Ext>
              , <Ext href="https://docs.convex.dev/auth/auth0">Auth0</Ext>, or
              any{" "}
              <Ext href="https://docs.convex.dev/auth/advanced/custom-auth">
                custom OpenID Connect provider
              </Ext>{" "}
              instead of the library below.
            </p>
            <p>
              The quickest path with no extra service is{" "}
              <Ext href="https://docs.convex.dev/auth/convex-auth">
                Convex Auth
              </Ext>
              , which runs entirely on your deployment. The short version of
              the setup:
            </p>
            <Code>{`npm install @convex-dev/auth @auth/core
npx @convex-dev/auth`}</Code>
            <p>
              The CLI wizard creates <K>convex/auth.ts</K> and the http routes
              for you. Then wrap the app in the auth provider from{" "}
              <K>@convex-dev/auth/react</K>, add a sign-in page, and turn off
              demo mode so the reset stops wiping data and writes require a
              signed-in user:
            </p>
            <Code>{`npx convex run demo:disableDemoMode         # dev
npx convex run demo:disableDemoMode --prod  # production`}</Code>
            <p>
              Once demo mode is off the reset handler is a no-op, but the cron
              still fires until you delete the <K>demo reset</K> line from{" "}
              <K>convex/crons.ts</K>. Keep the <K>agent tick</K> line; it
              drives the agent task queue. The{" "}
              <Ext href="https://labs.convex.dev/auth/setup">
                Convex Auth setup guide
              </Ext>{" "}
              walks through every step, including OAuth providers like GitHub
              and Google.
            </p>
            <p>
              Whichever provider you pick, the only server code that changes
              is <K>requireWriteAccess</K> in{" "}
              <K>convex/model/access.ts</K>: every write in the app already
              flows through that one check.
            </p>
          </Section>

          <Section id="deploy" title="Deploying to production">
            <p>
              Convex gives every project two deployments: dev (yours while you
              build) and production (the one you share). The website itself is
              served by the{" "}
              <Ext href="https://www.convex.dev/components/static-hosting">
                static hosting component
              </Ext>
              , so deploying is two commands and there is no separate web
              host. The component is already mounted in{" "}
              <K>convex/convex.config.ts</K> and the upload script already
              exists as <K>npm run deploy</K>; you do not need to install or
              configure anything for it.
            </p>
            <p>
              <span className="text-white">First,</span> set the required
              variables on production. Dev and production hold separate
              variables, so the values you set during setup do not carry
              over; a production push without these fails with a
              MissingEnvironmentVariables error:
            </p>
            <Code>{`npx convex env set CONTEXT_DEV_API_KEY unset --prod
npx convex env set FIRECRAWL_API_KEY unset --prod
npx convex env set EXA_API_KEY unset --prod`}</Code>
            <p>
              <span className="text-white">Then,</span> deploy. One command
              builds the frontend, pushes the backend to production, and
              uploads the site. This is the one time you use production
              commands instead of <K>dev</K>:
            </p>
            <Code>{`npm run deploy`}</Code>
            <p>
              <K>npm run deploy</K> uploads the built files from{" "}
              <K>dist/</K> into Convex file storage and serves them at your{" "}
              <K>*.convex.site</K> URL with an SPA fallback, so React Router
              paths like <K>/compare</K> and <K>/docs</K> work on refresh. To
              seed the production demo data once:
            </p>
            <Code>{`npx convex run demo:seedPublic --prod`}</Code>
            <p>
              A rule worth remembering: <K>npx convex dev</K> is for daily
              work and syncs to your dev deployment. <K>npx convex deploy</K>{" "}
              and anything with <K>--prod</K> touch production. If you are not
              shipping, you do not need them.
            </p>
          </Section>

          <Section id="custom-domain" title="Custom domain with Cloudflare">
            <p>
              The static hosting component serves this site at your{" "}
              <K>*.convex.site</K> URL. To serve it from a domain you own,
              register the domain in the Convex dashboard and point
              Cloudflare DNS at Convex. This walkthrough is the exact setup
              running on <K>realtimecrm.dev</K>: the bare domain serves the
              app and <K>www</K> redirects to it. Replace{" "}
              <K>yourdomain.com</K> with your real domain throughout.{" "}
              <Ext href="https://docs.convex.dev/production/custom-domains">
                Custom domains
              </Ext>{" "}
              require a Convex Pro plan, and your domain needs to be on
              Cloudflare already (the Free plan works; the{" "}
              <Ext href="https://developers.cloudflare.com/fundamentals/setup/manage-domains/add-site/">
                add a site guide
              </Ext>{" "}
              covers moving one over).
            </p>
            <p>
              One rule explains most of what follows: the only hostname
              allowed to point at <K>convex.domains</K> is the one you
              register in the Convex dashboard. Point any other hostname
              there and Cloudflare blocks it with error 1014. Getting this
              wrong, in both directions, caused every failure documented in
              the troubleshooting list below.
            </p>
            <p>
              <span className="text-white">1. Add the domain in Convex.</span>{" "}
              Open your production deployment in the{" "}
              <Ext href="https://dashboard.convex.dev">Convex dashboard</Ext>{" "}
              and go to Settings, Custom Domains. Enter{" "}
              <K>yourdomain.com</K>, bare, no www, and pick HTTP actions as
              the destination, since the static hosting component serves the
              site through HTTP routes. Convex shows two records: a CNAME
              target of <K>convex.domains</K> and a TXT verification token.
              Keep this tab open.
            </p>
            <p>
              <span className="text-white">2. Add three DNS records.</span>{" "}
              In Cloudflare, go to DNS, Records and create these:
            </p>
            <div className="overflow-x-auto rounded-lg border border-edge">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-edge bg-panel text-xs text-neutral-500">
                    <th className="px-3 py-2 font-medium">Type</th>
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Content</th>
                    <th className="px-3 py-2 font-medium">Proxy status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-edge/60 align-top">
                    <td className="px-3 py-2 font-mono text-[12px] text-neutral-200">
                      CNAME
                    </td>
                    <td className="px-3 py-2 font-mono text-[12px] text-neutral-200">
                      @
                    </td>
                    <td className="px-3 py-2 font-mono text-[12px] text-neutral-400">
                      convex.domains
                    </td>
                    <td className="px-3 py-2 text-neutral-500">
                      Proxied (orange cloud)
                    </td>
                  </tr>
                  <tr className="border-b border-edge/60 align-top">
                    <td className="px-3 py-2 font-mono text-[12px] text-neutral-200">
                      CNAME
                    </td>
                    <td className="px-3 py-2 font-mono text-[12px] text-neutral-200">
                      www
                    </td>
                    <td className="px-3 py-2 font-mono text-[12px] text-neutral-400">
                      yourdomain.com
                    </td>
                    <td className="px-3 py-2 text-neutral-500">
                      Proxied (orange cloud)
                    </td>
                  </tr>
                  <tr className="align-top">
                    <td className="px-3 py-2 font-mono text-[12px] text-neutral-200">
                      TXT
                    </td>
                    <td className="px-3 py-2 font-mono text-[12px] text-neutral-200">
                      _convex_domains
                    </td>
                    <td className="px-3 py-2 text-neutral-400">
                      Verification token from step 1
                    </td>
                    <td className="px-3 py-2 text-neutral-500">DNS only</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              The <K>@</K> record carries real traffic to Convex; Cloudflare
              flattens the CNAME at the apex automatically. The <K>www</K>{" "}
              record points back inside your own zone so the redirect rule
              in step 4 can catch it. Do not point <K>www</K> at{" "}
              <K>convex.domains</K>: Convex only registered the bare domain,
              so that combination is exactly the 1014 error. The TXT record
              proves to Convex that you own the domain.
            </p>
            <p>
              <span className="text-white">3. Set SSL to Full (strict).</span>{" "}
              Under SSL/TLS, Overview, set the encryption mode to Full
              (strict), and under Edge Certificates turn on Always Use
              HTTPS. Flexible mode causes its own redirect loop, so do not
              skip this. See the{" "}
              <Ext href="https://developers.cloudflare.com/ssl/">
                Cloudflare SSL docs
              </Ext>
              .
            </p>
            <p>
              <span className="text-white">4. Redirect www to the bare
              domain.</span> In Cloudflare go to Rules, Overview, Create
              rule, Redirect Rule. Use the custom filter expression editor
              and match on exactly this:
            </p>
            <Code>{`Field:     Hostname
Operator:  equals
Value:     www.yourdomain.com`}</Code>
            <p>
              Then set the redirect to Dynamic, status 301, Preserve query
              string on, with this expression:
            </p>
            <Code>{`concat("https://yourdomain.com", http.request.uri.path)`}</Code>
            <p>
              The trap here is the hostname. Cloudflare ships a template
              named Redirect from WWW to root, and if the match field ends
              up holding <K>yourdomain.com</K> instead of{" "}
              <K>www.yourdomain.com</K>, the rule redirects the bare domain
              to itself forever. That is the classic{" "}
              <K>ERR_TOO_MANY_REDIRECTS</K>, and it is the first thing this
              setup hit. The match value must be the www host, the target
              must be the bare host.
            </p>
            <p>
              <span className="text-white">5. Verify in Convex and set the
              site URL.</span> Back in the Convex dashboard, the domain gets
              a green checkmark once the TXT record propagates, usually
              within a couple of minutes. On the same settings page, under
              Override Environment Variables, set <K>CONVEX_SITE_URL</K> to{" "}
              <K>https://yourdomain.com</K> so HTTP action URLs and auth
              redirects use your domain. The first request after
              verification can take up to a minute while Convex mints the
              SSL certificate.
            </p>
            <p>
              <span className="text-white">6. Verify from the terminal.</span>
            </p>
            <Code>{`# Should return 200 from your app
curl -sI https://yourdomain.com

# Should return 301 with location: https://yourdomain.com/
curl -sI https://www.yourdomain.com

# Plain HTTP should upgrade via Always Use HTTPS
curl -sI http://yourdomain.com`}</Code>
            <p>
              <span className="text-white">Troubleshooting.</span> Every
              entry below is a failure that happened while setting up{" "}
              <K>realtimecrm.dev</K>, with the exact cause:
            </p>
            <ul className="flex list-disc flex-col gap-2 pl-5">
              <li>
                <K>ERR_TOO_MANY_REDIRECTS</K> on the bare domain. The
                redirect rule is matching the bare hostname and sending it
                to itself. Edit the rule so the match value is{" "}
                <K>www.yourdomain.com</K>. Confirm with{" "}
                <K>curl -sI https://yourdomain.com</K>: a{" "}
                <K>location:</K> header pointing at the same URL means the
                rule is still wrong.
              </li>
              <li>
                <K>403 Forbidden</K> with Cloudflare error 1014 on{" "}
                <K>www</K>. The www record points at{" "}
                <K>convex.domains</K> but Convex only registered the bare
                domain. Change the www record content to{" "}
                <K>yourdomain.com</K> and let the redirect rule handle it.
              </li>
              <li>
                <K>403 Forbidden</K> on the bare domain after it worked
                before. The domain registered in Convex no longer matches
                the hostname that CNAMEs to <K>convex.domains</K>. This
                happened here when the Convex entry was switched to{" "}
                <K>www.yourdomain.com</K> mid-debug; switching it back to
                the bare domain fixed it. The two must always agree.
              </li>
              <li>
                <K>403</K> for a minute or two right after adding or
                re-adding the domain in Convex. Verification and
                certificate minting are in flight. Wait, then retry.
              </li>
              <li>
                The site works in curl but not in your browser. Browsers
                cache 301 redirects hard. Test in a private window or clear
                the cache for the domain.
              </li>
            </ul>
            <p>
              <span className="text-white">Doing it from the CLI or an
              agent.</span> The dashboard is fine for one domain, but
              everything above is also scriptable, which means a coding
              agent can do it, and the curl checks in step 6 work from any
              terminal. Create a scoped API token at{" "}
              <Ext href="https://dash.cloudflare.com/profile/api-tokens">
                dash.cloudflare.com/profile/api-tokens
              </Ext>{" "}
              with Zone, DNS, Edit permission (add Zone, Dynamic URL
              Redirect, Edit to manage the rule too), then drive the{" "}
              <Ext href="https://developers.cloudflare.com/api/">
                Cloudflare API
              </Ext>{" "}
              directly:
            </p>
            <Code>{`# List records to find the zone state
curl "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \\
  --header "Authorization: Bearer $CLOUDFLARE_API_TOKEN"

# Create the apex CNAME
curl "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \\
  --request POST \\
  --header "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \\
  --json '{"type":"CNAME","name":"yourdomain.com","content":"convex.domains","proxied":true}'`}</Code>
            <p>
              Cloudflare also publishes{" "}
              <Ext href="https://developers.cloudflare.com/agents/model-context-protocol/mcp-servers-for-cloudflare/">
                MCP servers
              </Ext>{" "}
              you can add to Cursor or another MCP client; the docs server
              answers configuration questions in place, and the others cover
              Workers and observability. DNS record edits still go through
              the API token above, so a good setup for an agent is the docs
              MCP for reference plus the API token for changes. Hand the
              agent this section, the token, and your domain, and it can run
              the whole checklist including verification.
            </p>
          </Section>

          <Section
            id="coding-agents"
            title="Using Cursor, Codex, or other tools"
          >
            <p>
              The fastest path is to let a coding agent do the setup. The Copy
              the setup prompt button on the{" "}
              <Link
                to="/"
                className={LINK_CLASS}
              >
                landing page
              </Link>{" "}
              puts this on your clipboard:
            </p>
            <Code>{`Set up waynesutton/trycrm-convex. Install the dependencies with npm, run npx convex dev to create my deployment, set CONTEXT_DEV_API_KEY, FIRECRAWL_API_KEY, and EXA_API_KEY to the literal string unset, and tell me which optional keys I still need.`}</Code>
            <p>
              Paste it into Cursor's agent, Codex, Claude Code, T3 Chat, or
              whatever you use. The repo ships an <K>AGENTS.md</K> file that
              coding agents read automatically, so they know the project
              conventions before they start. A few tool-specific notes:
            </p>
            <ul className="flex list-disc flex-col gap-2 pl-5">
              <li>
                <span className="text-white">Cursor.</span> Open the cloned
                folder, paste the prompt into Agent mode. The Convex plugin
                gives it dashboard access if you have it installed.
              </li>
              <li>
                <span className="text-white">Codex or Claude Code.</span> Run
                it inside the repo folder. Both read <K>AGENTS.md</K> /{" "}
                <K>CLAUDE.md</K> on their own.
              </li>
              <li>
                <span className="text-white">Cloud-based agents.</span> If the
                agent runs on someone else's machine and cannot log in to
                Convex, have it set <K>CONVEX_AGENT_MODE=anonymous</K> before{" "}
                <K>npx convex dev</K> so it gets an isolated deployment
                instead of touching yours.
              </li>
            </ul>
            <p>
              Using your fork as a real CRM, not a public demo? There is a
              second prompt for that. It turns off demo mode so the 10 minute
              reset cron can never wipe your data, then removes the cron:
            </p>
            <Code>{`I forked waynesutton/trycrm-convex and I am using it as a real CRM, not a public demo. Make sure my data is never wiped: run npx convex run demo:disableDemoMode on my dev deployment, and if I have a production deployment run it again with --prod. Then delete the demo reset cron line from convex/crons.ts and push. Leave the agent tick cron in place. Finish by confirming the workspace row has demoMode set to false.`}</Code>
          </Section>

          <Section id="components" title="Every component in this app">
            <p>
              Convex components are installable building blocks that run
              inside your deployment with their own tables and functions. This
              app uses fifteen. Each link goes to the component's directory
              page.
            </p>
            <ul className="flex list-disc flex-col gap-2 pl-5">
              <li>
                <Ext href="https://www.convex.dev/components/static-hosting">
                  Static hosting
                </Ext>{" "}
                serves this website from Convex file storage.
              </li>
              <li>
                <Ext href="https://www.convex.dev/components/agent">Agent</Ext>{" "}
                runs the research agents and record chat with per-thread
                memory.
              </li>
              <li>
                <Ext href="https://www.convex.dev/components/workflow">
                  Workflow
                </Ext>{" "}
                keeps multi-step agent runs durable across restarts.
              </li>
              <li>
                <Ext href="https://www.convex.dev/components/workpool">
                  Workpool
                </Ext>{" "}
                gives each agent a bounded queue so no one floods the system.
              </li>
              <li>
                <Ext href="https://www.convex.dev/components/crons">Crons</Ext>{" "}
                schedules recurring work, including the 10 minute demo reset.
              </li>
              <li>
                <Ext href="https://www.convex.dev/components/action-retrier">
                  Action retrier
                </Ext>{" "}
                retries flaky external calls with backoff.
              </li>
              <li>
                <Ext href="https://www.convex.dev/components/action-cache">
                  Action cache
                </Ext>{" "}
                caches enrichment lookups for 7 days.
              </li>
              <li>
                <Ext href="https://www.convex.dev/components/rate-limiter">
                  Rate limiter
                </Ext>{" "}
                keeps chat and enrichment within per-user budgets.
              </li>
              <li>
                <Ext href="https://www.convex.dev/components/aggregate">
                  Aggregate
                </Ext>{" "}
                powers the dashboard rollups without table scans.
              </li>
              <li>
                <Ext href="https://www.convex.dev/components/migrations">
                  Migrations
                </Ext>{" "}
                handles schema backfills as the data model evolves.
              </li>
              <li>
                <Ext href="https://www.convex.dev/components/resend">
                  Resend
                </Ext>{" "}
                sends outbound notification email.
              </li>
              <li>
                <Ext href="https://www.convex.dev/components/agentmail/convex">
                  AgentMail
                </Ext>{" "}
                gives agents a persistent inbox with reactive threads.
              </li>
              <li>
                <Ext href="https://www.convex.dev/components/context-dot-dev/convex">
                  Context.dev
                </Ext>{" "}
                supplies brand data for company enrichment and doubles as a
                web search and scraping provider for the chat agent.
              </li>
              <li>
                <Ext href="https://www.convex.dev/components/firecrawl/firecrawl-convex">
                  Firecrawl
                </Ext>{" "}
                scrapes web pages for the chat agent.
              </li>
              <li>
                <Ext href="https://www.convex.dev/components/exalabs/convex-exa">
                  Exa
                </Ext>{" "}
                runs semantic web search for the chat agent.
              </li>
            </ul>
          </Section>

          <Section id="resources" title="Resources">
            <ul className="flex list-disc flex-col gap-2 pl-5">
              <li>
                <Ext href="https://docs.convex.dev/home">Convex docs</Ext>,
                the main reference for everything below.
              </li>
              <li>
                <Ext href="https://docs.convex.dev/components/using">
                  Using components
                </Ext>{" "}
                explains how components mount into a deployment.
              </li>
              <li>
                <Ext href="https://docs.convex.dev/scheduling/cron-jobs">
                  Cron jobs
                </Ext>{" "}
                covers the scheduler behind the demo reset.
              </li>
              <li>
                <Ext href="https://docs.convex.dev/auth/overview">
                  Auth overview
                </Ext>{" "}
                and <Ext href="https://labs.convex.dev/auth">Convex Auth</Ext>{" "}
                for adding sign-in to your fork with Convex Auth, Clerk,
                WorkOS AuthKit, Auth0, or any OpenID Connect provider.
              </li>
              <li>
                <Ext href="https://docs.convex.dev/production">
                  Production guide
                </Ext>{" "}
                for deploy keys, custom domains, and environments.
              </li>
              <li>
                <Ext href="https://github.com/waynesutton/trycrm-convex">
                  This repo
                </Ext>{" "}
                and the{" "}
                <Ext href="https://github.com/trycompai/crm">
                  original by Comp AI
                </Ext>
                , both MIT licensed.
              </li>
            </ul>
          </Section>
        </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
