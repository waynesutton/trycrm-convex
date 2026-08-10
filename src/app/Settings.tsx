import { useAction, useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  Input,
  PageHeader,
  Panel,
} from "../components/ui";
import { NAV_ITEMS } from "./AppLayout";
import { EntitySettingsSection } from "./EntitySettingsSection";

// Settings grew past one scroll, so each concern gets its own page under
// /app/settings/:section with a sub-sidebar, the same pattern as Ask.

const SECTIONS = [
  { id: "team", label: "Team" },
  { id: "companies", label: "Companies" },
  { id: "contacts", label: "Contacts" },
  { id: "deals", label: "Deals" },
  { id: "integrations", label: "Integrations" },
  { id: "slack", label: "Slack" },
  { id: "email", label: "Email" },
  { id: "ai", label: "AI provider" },
  { id: "sidebar", label: "Sidebar" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const SUBTITLES: Record<SectionId, string> = {
  team: "Workspace members and sign-in.",
  companies: "Defaults, columns, and custom fields for companies.",
  contacts: "Defaults, columns, and custom fields for contacts.",
  deals: "Defaults, columns, and custom fields for deals.",
  integrations: "API keys and what each one enables.",
  slack: "Notifications and the /crm bot, off by default.",
  email: "Provider, from identity, and signature.",
  ai: "Which model provider runs the chat surfaces.",
  sidebar: "Show or hide sidebar items.",
};

export function Settings() {
  const { section } = useParams<{ section?: string }>();
  // Old bookmarks to /app/settings/fields land on the Companies section,
  // which is where custom company fields now live.
  const normalized = section === "fields" ? "companies" : section;
  const active: SectionId = SECTIONS.some((s) => s.id === normalized)
    ? (normalized as SectionId)
    : "team";

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Settings" subtitle={SUBTITLES[active]} />
      <div className="flex flex-col gap-6 md:flex-row">
        <nav className="flex shrink-0 gap-1 overflow-x-auto md:w-44 md:flex-col">
          {SECTIONS.map((item) => (
            <Link
              key={item.id}
              to={
                item.id === "team"
                  ? "/app/settings"
                  : `/app/settings/${item.id}`
              }
              className={`rounded-md px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors ${
                active === item.id
                  ? "bg-raised text-white"
                  : "text-neutral-500 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0 flex-1">
          {active === "team" ? <TeamSection /> : null}
          {active === "companies" ? (
            <EntitySettingsSection entity="company" />
          ) : null}
          {active === "contacts" ? (
            <EntitySettingsSection entity="contact" />
          ) : null}
          {active === "deals" ? <EntitySettingsSection entity="deal" /> : null}
          {active === "integrations" ? <IntegrationsSection /> : null}
          {active === "slack" ? <SlackSection /> : null}
          {active === "email" ? <EmailSection /> : null}
          {active === "ai" ? <AiSection /> : null}
          {active === "sidebar" ? <SidebarSection /> : null}
        </div>
      </div>
    </div>
  );
}

function TeamSection() {
  const users = useQuery(api.users.list);
  const demo = useQuery(api.demo.info);
  return (
    <Panel className="p-4">
      <h3 className="mb-3 text-sm font-medium text-white">Team</h3>
      {demo?.demoMode ? (
        <div className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs leading-relaxed text-amber-200/90">
          <span className="font-medium">Demo users.</span> Everyone below is
          fake, seeded with the demo data. None of them can sign in or
          receive email. Your fork starts with its own team list.
        </div>
      ) : null}
      <div className="flex flex-col gap-2">
        {users?.map((user) => (
          <div key={user._id} className="flex items-center gap-2 text-sm">
            <Avatar name={user.name} src={user.avatarUrl} />
            <span className="text-neutral-200">{user.name}</span>
            <span className="text-neutral-600">{user.email}</span>
            {user.role ? <Badge>{user.role}</Badge> : null}
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-neutral-600">
        Sign-in is disabled on this demo. In a real install Convex Auth
        handles sign-in and this table maps to authenticated users, with an
        allow list that fails closed.
      </p>
    </Panel>
  );
}

function IntegrationsSection() {
  const capabilities = useQuery(api.capabilities.status);
  return (
    <div className="flex flex-col gap-4">
      <Panel className="p-4">
        <h3 className="mb-3 text-sm font-medium text-white">Integrations</h3>
        <div className="flex flex-col gap-3 text-sm">
          <IntegrationRow
            name="Context.dev brand data and web research"
            detail="Set CONTEXT_DEV_API_KEY to enable company enrichment. The same key also gives the chat agent web search and page reading when Exa or Firecrawl keys are missing."
            configured={capabilities?.contextDev}
            docsId="web-research"
          />
          <IntegrationRow
            name="OpenAI"
            detail="Set OPENAI_API_KEY to enable chat and agent reasoning."
            configured={capabilities?.openai}
            docsId="ai-providers"
          />
          <IntegrationRow
            name="Anthropic (Claude)"
            detail="Set ANTHROPIC_API_KEY to run chat on Claude instead."
            configured={capabilities?.anthropic}
            docsId="ai-providers"
          />
          <IntegrationRow
            name="OpenRouter"
            detail="Set OPENROUTER_API_KEY to route chat through OpenRouter."
            configured={capabilities?.openrouter}
            docsId="ai-providers"
          />
          <IntegrationRow
            name="Firecrawl web scraping"
            detail="Set FIRECRAWL_API_KEY so the chat agent can read web pages. Context.dev covers this when only its key is set."
            configured={capabilities?.firecrawl}
            docsId="web-research"
          />
          <IntegrationRow
            name="Exa web search"
            detail="Set EXA_API_KEY so the chat agent can search the web. Context.dev covers this when only its key is set."
            configured={capabilities?.exa}
            docsId="web-research"
          />
          <IntegrationRow
            name="Resend email"
            detail="Set RESEND_API_KEY to enable outbound email."
            configured={capabilities?.resend}
            docsId="email"
          />
          <IntegrationRow
            name="AgentMail inbox"
            detail="Set AGENTMAIL_API_KEY and AGENTMAIL_INBOX_ID for a persistent agent inbox."
            configured={capabilities?.agentmail}
            docsId="email"
          />
        </div>
        <p className="mt-4 text-xs leading-relaxed text-neutral-500">
          Every key is explained in the{" "}
          <Link
            to="/docs#environment-variables"
            className="text-accent underline-offset-2 hover:underline"
          >
            environment variables guide
          </Link>
          , including where to create each account.
        </p>
      </Panel>

      <Panel className="p-4">
        <h3 className="mb-1 text-sm font-medium text-white">
          Adding API keys
        </h3>
        <p className="mb-3 text-xs leading-relaxed text-neutral-500">
          API keys live on your Convex deployment, not in this app or in a
          local .env file. Set one from your project folder and the feature
          turns on within seconds, no redeploy needed:
        </p>
        <CommandBlock>{`npx convex env set OPENAI_API_KEY sk-your-key`}</CommandBlock>
        <p className="mt-3 mb-3 text-xs leading-relaxed text-neutral-500">
          Every Convex project has two deployments with separate variables:
          dev, which you use while building, and production, the one you
          share. The command above only sets the key on dev. To set it on
          production, add <Mono>--prod</Mono>:
        </p>
        <CommandBlock>{`npx convex env set OPENAI_API_KEY sk-your-key --prod`}</CommandBlock>
        <p className="mt-3 text-xs leading-relaxed text-neutral-500">
          If a key works on your machine but not on your live site, this
          split is almost always why: it was set on dev only. You can also
          add keys in the{" "}
          <a
            href="https://dashboard.convex.dev"
            className="text-accent underline-offset-2 hover:underline"
          >
            Convex dashboard
          </a>{" "}
          under Settings, then Environment Variables, picking the deployment
          first. See{" "}
          <Link
            to="/docs#environment-variables"
            className="text-accent underline-offset-2 hover:underline"
          >
            environment variables
          </Link>{" "}
          for the full key list and{" "}
          <Link to="/docs#deploy" className="text-accent underline-offset-2 hover:underline">
            deploying to production
          </Link>{" "}
          for when <Mono>--prod</Mono> matters.
        </p>
      </Panel>
    </div>
  );
}

function SlackSection() {
  const capabilities = useQuery(api.capabilities.status);
  const settings = useQuery(api.slack.settings);
  const setSettings = useMutation(api.slack.setSettings);
  const sendTest = useAction(api.slack.sendTest);
  const listChannels = useAction(api.slack.channels);

  // Channel picker state: channels load on demand through a bot-token
  // action, then filter locally as you type.
  const [channels, setChannels] = useState<Array<{
    id: string;
    name: string;
    isPrivate: boolean;
  }> | null>(null);
  const [channelSearch, setChannelSearch] = useState("");
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [channelsError, setChannelsError] = useState<string | null>(null);

  // Test button state.
  const [testStatus, setTestStatus] = useState<
    { kind: "success" | "error"; message: string } | null
  >(null);
  const [testing, setTesting] = useState(false);

  // Allowed email domain draft for the bot card.
  const [domainDraft, setDomainDraft] = useState("");
  const [domainLoaded, setDomainLoaded] = useState(false);
  useEffect(() => {
    if (!settings || domainLoaded) return;
    setDomainDraft(settings.allowedEmailDomain ?? "");
    setDomainLoaded(true);
  }, [settings, domainLoaded]);

  const anySendConfigured =
    (capabilities?.slackWebhook ?? false) || (capabilities?.slackBot ?? false);

  const loadChannels = async () => {
    setChannelsLoading(true);
    setChannelsError(null);
    try {
      setChannels(await listChannels());
    } catch (err) {
      setChannelsError(
        err instanceof Error ? err.message : "Could not load channels",
      );
    } finally {
      setChannelsLoading(false);
    }
  };

  const runTest = async () => {
    setTesting(true);
    setTestStatus(null);
    try {
      await sendTest();
      setTestStatus({
        kind: "success",
        message: "Test message posted. Check your Slack channel.",
      });
    } catch (err) {
      setTestStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Test failed",
      });
    } finally {
      setTesting(false);
    }
  };

  const filteredChannels = channels?.filter((channel) =>
    channel.name.toLowerCase().includes(channelSearch.trim().toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-4">
      <Panel className="p-4">
        <div className="mb-1 flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-white">
            Slack notifications
          </h3>
          <SlackToggle
            checked={settings?.enabled ?? false}
            onChange={(next) => void setSettings({ enabled: next })}
            label={settings?.enabled ? "On" : "Off"}
          />
        </div>
        <p className="mb-3 text-xs leading-relaxed text-neutral-500">
          Post CRM events to a Slack channel: new companies and contacts,
          deal stage moves, task completions, and agent run summaries. Off
          by default; nothing posts until you turn it on and connect Slack.
          The full setup walkthrough is in{" "}
          <Link to="/docs#slack" className="text-accent underline-offset-2 hover:underline">
            Slack: notifications and the bot
          </Link>
          .
        </p>
        <div className="mb-4 flex flex-col gap-3 text-sm">
          <IntegrationRow
            name="Incoming webhook (simple mode)"
            detail="Set SLACK_WEBHOOK_URL to post to one fixed channel. Two minutes of setup, no app scopes."
            configured={capabilities?.slackWebhook}
            docsId="slack"
          />
          <IntegrationRow
            name="Bot token (full mode)"
            detail="Set SLACK_BOT_TOKEN (xoxb-...) to pick the channel below and enable the /crm bot. Needs the chat:write scope."
            configured={capabilities?.slackBot}
            docsId="slack"
          />
          <IntegrationRow
            name="Signing secret (bot commands)"
            detail="Set SLACK_SIGNING_SECRET so inbound /crm commands verify. Only needed for the bot, not for notifications."
            configured={capabilities?.slackSigning}
            docsId="slack"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={() => void runTest()}
            disabled={testing || !anySendConfigured}
          >
            {testing ? "Sending..." : "Send test message"}
          </Button>
          {!anySendConfigured ? (
            <span className="text-xs text-neutral-600">
              Set a webhook URL or bot token first.
            </span>
          ) : null}
          {testStatus ? (
            <span
              className={`text-xs ${
                testStatus.kind === "success"
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {testStatus.message}
            </span>
          ) : null}
        </div>
      </Panel>

      <Panel className="p-4">
        <h3 className="mb-1 text-sm font-medium text-white">What posts</h3>
        <p className="mb-3 text-xs leading-relaxed text-neutral-500">
          Each event type has its own switch. Demo mode never posts; every
          send and skip shows on the Activity page.
        </p>
        <div className="flex flex-col gap-2.5">
          <SlackToggle
            checked={settings?.notifyRecords ?? true}
            onChange={(next) => void setSettings({ notifyRecords: next })}
            label="New companies and contacts"
          />
          <SlackToggle
            checked={settings?.notifyDeals ?? true}
            onChange={(next) => void setSettings({ notifyDeals: next })}
            label="New deals and stage changes"
          />
          <SlackToggle
            checked={settings?.notifyTasks ?? false}
            onChange={(next) => void setSettings({ notifyTasks: next })}
            label="Task completions"
          />
          <SlackToggle
            checked={settings?.notifyAgent ?? false}
            onChange={(next) => void setSettings({ notifyAgent: next })}
            label="Agent run summaries"
          />
        </div>
      </Panel>

      <Panel className="p-4">
        <h3 className="mb-1 text-sm font-medium text-white">Channel</h3>
        <p className="mb-3 text-xs leading-relaxed text-neutral-500">
          Bot token mode posts to the channel you pick here. Webhook mode
          ignores this; the channel is baked into the webhook URL. After
          picking a channel, invite the bot to it in Slack with{" "}
          <Mono>/invite @your-bot-name</Mono> or posts fail with
          not_in_channel.
        </p>
        <p className="mb-3 text-xs text-neutral-400">
          Posting to:{" "}
          {settings?.channelName ? (
            <span className="text-neutral-200">#{settings.channelName}</span>
          ) : (
            <span className="text-neutral-600">no channel selected</span>
          )}
        </p>
        {channels === null ? (
          <div className="flex items-center gap-3">
            <Button
              onClick={() => void loadChannels()}
              disabled={channelsLoading || !capabilities?.slackBot}
            >
              {channelsLoading ? "Loading..." : "Load channels"}
            </Button>
            {!capabilities?.slackBot ? (
              <span className="text-xs text-neutral-600">
                Needs SLACK_BOT_TOKEN with the channels:read scope.
              </span>
            ) : null}
          </div>
        ) : (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Input
                value={channelSearch}
                onChange={(e) => setChannelSearch(e.target.value)}
                placeholder="Search channels"
              />
              <Button
                onClick={() => void loadChannels()}
                disabled={channelsLoading}
              >
                {channelsLoading ? "Loading..." : "Refresh"}
              </Button>
            </div>
            <div className="max-h-56 overflow-y-auto rounded-md border border-edge">
              {filteredChannels && filteredChannels.length > 0 ? (
                filteredChannels.map((channel) => {
                  const selected = settings?.channelId === channel.id;
                  return (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() =>
                        void setSettings({
                          channelId: channel.id,
                          channelName: channel.name,
                        })
                      }
                      className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-sm transition-colors ${
                        selected
                          ? "bg-raised text-white"
                          : "text-neutral-400 hover:bg-raised/50 hover:text-white"
                      }`}
                    >
                      <span>
                        #{channel.name}
                        {channel.isPrivate ? (
                          <span className="ml-2 text-[10px] text-neutral-600">
                            private
                          </span>
                        ) : null}
                      </span>
                      {selected ? (
                        <span className="text-[10px] text-emerald-400">
                          selected
                        </span>
                      ) : null}
                    </button>
                  );
                })
              ) : (
                <p className="px-3 py-2 text-xs text-neutral-600">
                  No channels match.
                </p>
              )}
            </div>
          </div>
        )}
        {channelsError ? (
          <p className="mt-2 text-xs text-red-400">{channelsError}</p>
        ) : null}
      </Panel>

      <Panel className="p-4">
        <div className="mb-1 flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-white">/crm bot</h3>
          <SlackToggle
            checked={settings?.botEnabled ?? false}
            onChange={(next) => void setSettings({ botEnabled: next })}
            label={settings?.botEnabled ? "On" : "Off"}
          />
        </div>
        <p className="mb-3 text-xs leading-relaxed text-neutral-500">
          Work the CRM from Slack: /crm find, /crm deal, /crm note, /crm
          task, /crm activity. Needs SLACK_BOT_TOKEN and
          SLACK_SIGNING_SECRET plus a slash command pointed at this
          deployment; the{" "}
          <Link to="/docs#slack" className="text-accent underline-offset-2 hover:underline">
            docs
          </Link>{" "}
          walk through it. Only workspace members can act. The bot matches
          your Slack profile email against the Team list, or the domain
          below.
        </p>
        <label className="mb-1 block text-xs text-neutral-500">
          Allowed email domain (optional)
        </label>
        <div className="flex items-center gap-2">
          <div className="w-full sm:w-64">
            <Input
              value={domainDraft}
              onChange={(e) => setDomainDraft(e.target.value)}
              placeholder="yourcompany.com"
            />
          </div>
          <Button
            onClick={() =>
              void setSettings({
                allowedEmailDomain: domainDraft.trim().replace(/^@/, ""),
              })
            }
          >
            Save
          </Button>
        </div>
        <p className="mt-2 text-xs text-neutral-600">
          Anyone whose Slack email ends in this domain can use the bot even
          if they are not in the Team list. Leave blank to restrict to Team
          members only.
        </p>
      </Panel>
    </div>
  );
}

// Small switch used across the Slack card. Same look as the sidebar
// checkboxes but reads as on/off.
function SlackToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-300">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-emerald-600" : "bg-raised"
        }`}
      >
        <span
          className={`absolute left-0 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
        />
      </button>
      {label}
    </label>
  );
}

function EmailSection() {
  const capabilities = useQuery(api.capabilities.status);
  const emailProvider = useQuery(api.email.provider);
  const setEmailProvider = useMutation(api.email.setProvider);
  const settings = useQuery(api.email.settings);
  const setSettings = useMutation(api.email.setSettings);

  const [fromName, setFromName] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [signature, setSignature] = useState("");
  const [saved, setSaved] = useState(false);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  // Fill the form once when the stored settings arrive; edits after that
  // are local until Save.
  useEffect(() => {
    if (!settings || loadedFor === "email") return;
    setFromName(settings.fromName ?? "");
    setFromAddress(settings.fromAddress ?? "");
    setSignature(settings.signature ?? "");
    setLoadedFor("email");
  }, [settings, loadedFor]);

  const save = async () => {
    await setSettings({
      fromName: fromName.trim() || undefined,
      fromAddress: fromAddress.trim() || undefined,
      signature: signature.trim() || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      <Panel className="p-4">
        <h3 className="mb-1 text-sm font-medium text-white">Email provider</h3>
        <p className="mb-3 text-xs leading-relaxed text-neutral-500">
          Composed emails and agent notifications go out through one
          provider. Resend is plain outbound email; AgentMail also gives
          agents a persistent inbox with threads synced into Convex. The
          switch works even before keys are set; sending stays off until the
          selected provider is configured. Setup steps for both are in{" "}
          <Link to="/docs#email" className="text-accent underline-offset-2 hover:underline">
            email: Resend and AgentMail
          </Link>
          .
        </p>
        <div className="flex gap-2">
          {(["resend", "agentmail"] as const).map((option) => {
            const active = (emailProvider ?? "resend") === option;
            const configured =
              option === "resend"
                ? capabilities?.resend
                : capabilities?.agentmail;
            return (
              <button
                key={option}
                type="button"
                onClick={() => void setEmailProvider({ provider: option })}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "border-edge-strong bg-raised text-white"
                    : "border-edge text-neutral-400 hover:text-white"
                }`}
              >
                {option === "resend" ? "Resend" : "AgentMail"}
                <span className="ml-2 text-[10px] text-neutral-500">
                  {configured ? "configured" : "no key"}
                </span>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel className="p-4">
        <h3 className="mb-1 text-sm font-medium text-white">
          Compose defaults
        </h3>
        <p className="mb-4 text-xs leading-relaxed text-neutral-500">
          The Email button on company and contact pages opens a compose
          window. These fields set who the mail comes from and the signature
          that appends to every message. With Resend the from address must
          belong to a domain you verified in Resend; AgentMail sends from
          your inbox address, so the from fields apply to Resend only.
        </p>
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-neutral-500">
              From name
            </label>
            <Input
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              placeholder="Ada from CRM"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-500">
              From address
            </label>
            <Input
              value={fromAddress}
              onChange={(e) => setFromAddress(e.target.value)}
              placeholder="ada@yourdomain.com"
            />
          </div>
        </div>
        <label className="mb-1 block text-xs text-neutral-500">
          Default signature
        </label>
        <textarea
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          rows={3}
          placeholder={"Best,\nAda"}
          className="mb-4 w-full resize-y rounded-md border border-edge bg-ink px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-accent focus:outline-none"
        />
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={() => void save()}>
            Save
          </Button>
          {saved ? (
            <span className="text-xs text-emerald-400">Saved.</span>
          ) : null}
        </div>
      </Panel>
    </div>
  );
}

function AiSection() {
  const capabilities = useQuery(api.capabilities.status);
  const aiProvider = useQuery(api.prefs.aiProvider);
  const setAiProvider = useMutation(api.prefs.setAiProvider);
  return (
    <Panel className="p-4">
      <h3 className="mb-1 text-sm font-medium text-white">AI provider</h3>
      <p className="mb-3 text-xs leading-relaxed text-neutral-500">
        The Ask page and record chat run on one model provider. None of
        these keys ship by default: pick a provider, set its key on the
        deployment, and the chat starts reasoning. Until then it answers
        with the exact key it needs. See{" "}
        <Link to="/docs#ai-providers" className="text-accent underline-offset-2 hover:underline">
          AI providers
        </Link>{" "}
        for the setup steps.
      </p>
      <div className="flex gap-2">
        {(
          [
            { id: "openai", label: "OpenAI" },
            { id: "anthropic", label: "Claude" },
            { id: "openrouter", label: "OpenRouter" },
          ] as const
        ).map((option) => {
          const active = (aiProvider ?? "openai") === option.id;
          const configured = capabilities?.[option.id];
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => void setAiProvider({ provider: option.id })}
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                active
                  ? "border-edge-strong bg-raised text-white"
                  : "border-edge text-neutral-400 hover:text-white"
              }`}
            >
              {option.label}
              <span className="ml-2 text-[10px] text-neutral-500">
                {configured ? "configured" : "no key"}
              </span>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

function SidebarSection() {
  const sidebarPrefs = useQuery(api.prefs.sidebar);
  const setSidebarHidden = useMutation(api.prefs.setSidebarHidden);
  return (
    <Panel className="p-4">
      <h3 className="mb-1 text-sm font-medium text-white">Sidebar</h3>
      <p className="mb-3 text-xs leading-relaxed text-neutral-600">
        Choose which items show in the sidebar. Drag items in the sidebar
        itself to reorder them. Settings and Docs always stay visible.
      </p>
      <div className="flex flex-wrap gap-3">
        {NAV_ITEMS.map((item) => {
          const hidden = sidebarPrefs?.hidden.includes(item.id) ?? false;
          return (
            <label
              key={item.id}
              className="flex cursor-pointer items-center gap-2 text-sm text-neutral-300"
            >
              <Checkbox
                checked={!hidden}
                ariaLabel={`Show ${item.label} in sidebar`}
                onChange={() => {
                  const current = sidebarPrefs?.hidden ?? [];
                  const next = hidden
                    ? current.filter((id) => id !== item.id)
                    : [...current, item.id];
                  void setSidebarHidden({ hidden: next });
                }}
              />
              {item.label}
            </label>
          );
        })}
      </div>
    </Panel>
  );
}

// Each row links straight into the docs section that walks through that
// key: where to create the account, the exact env set command, and what
// the feature does once the key is live.
function IntegrationRow({
  name,
  detail,
  configured,
  docsId,
}: {
  name: string;
  detail: string;
  configured: boolean | undefined;
  docsId: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-neutral-200">{name}</p>
        <p className="text-xs text-neutral-500">
          {detail}{" "}
          <Link
            to={`/docs#${docsId}`}
            className="whitespace-nowrap text-accent underline-offset-2 hover:underline"
          >
            Setup guide
          </Link>
        </p>
      </div>
      {configured === undefined ? null : (
        <span
          className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] ${
            configured
              ? "bg-emerald-800/40 text-emerald-400"
              : "bg-raised text-neutral-500"
          }`}
        >
          {configured ? "configured" : "not set"}
        </span>
      )}
    </div>
  );
}

// Copyable command line, styled like the docs page code blocks.
function CommandBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-md border border-edge bg-raised px-3 py-2 font-mono text-[12px] leading-relaxed text-neutral-200">
      {children}
    </pre>
  );
}

function Mono({ children }: { children: string }) {
  return (
    <code className="rounded bg-raised px-1 py-0.5 font-mono text-[11px] text-neutral-200">
      {children}
    </code>
  );
}
