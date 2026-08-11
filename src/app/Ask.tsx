import { useUIMessages } from "@convex-dev/agent/react";
import { useMutation, useQuery } from "convex/react";
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { timeAgo } from "../lib/format";

// Ask: a workspace chat in the shape of Claude's UI. A sub-sidebar lists
// past chats with archive and delete; the main pane greets, takes a prompt,
// and streams the reply in. Slash commands route to the agent's tools.

const SLASH_COMMANDS = [
  {
    command: "/search",
    hint: "Search the web (Exa)",
    template: "Search the web for ",
  },
  {
    command: "/read",
    hint: "Read a web page (Firecrawl)",
    template: "Read this page and summarize it: ",
  },
  {
    command: "/crm",
    hint: "Answer from CRM data",
    template: "Using only our CRM data, ",
  },
  {
    command: "/task",
    hint: "Add a task ('in 3 days' or 'on Aug 15')",
    template: "/task ",
  },
  {
    command: "/note",
    hint: "Add a note, no model needed",
    template: "/note ",
  },
] as const;

const SUGGESTIONS = [
  "Which deals need attention this week?",
  "/crm summarize the pipeline by stage",
  "/search recent news about our largest account",
];

const PROVIDER_LABELS = {
  openai: "OpenAI",
  anthropic: "Claude",
  openrouter: "OpenRouter",
  grok: "Grok",
  deepseek: "DeepSeek",
} as const;

export function Ask() {
  const threads = useQuery(api.ask.threads);
  const send = useMutation(api.ask.send);
  const setArchived = useMutation(api.ask.setArchived);
  const remove = useMutation(api.ask.remove);
  const provider = useQuery(api.prefs.aiProvider);
  const capabilities = useQuery(api.capabilities.status);

  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const active = threads?.filter((t) => !t.archived) ?? [];
  const archived = threads?.filter((t) => t.archived) ?? [];
  // A reset or delete can remove the selected thread; fall back to new chat.
  const selected =
    activeThreadId && threads?.some((t) => t.threadId === activeThreadId)
      ? activeThreadId
      : null;

  const providerReady =
    provider && capabilities ? capabilities[provider] : false;

  const onDelete = async (id: Id<"askThreads">, threadId: string) => {
    if (threadId === selected) setActiveThreadId(null);
    await remove({ id });
  };

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col gap-4 md:flex-row">
      <aside className="flex w-full shrink-0 flex-col rounded-lg border border-edge bg-panel md:w-56">
        <div className="border-b border-edge p-2">
          <button
            onClick={() => setActiveThreadId(null)}
            className="w-full rounded-md bg-primary px-3 py-1.5 text-sm text-primary-ink transition-colors hover:bg-primary-hover"
          >
            New chat
          </button>
        </div>
        <div className="max-h-40 min-h-0 flex-1 overflow-y-auto p-2 md:max-h-none">
          <p className="px-2 pb-1 text-[10px] font-medium uppercase tracking-wide text-neutral-600">
            Chats
          </p>
          {active.length === 0 ? (
            <p className="px-2 py-2 text-xs text-neutral-600">
              No chats yet.
            </p>
          ) : (
            active.map((thread) => (
              <ThreadRow
                key={thread._id}
                title={thread.title}
                when={thread.lastMessageAt}
                selected={thread.threadId === selected}
                onOpen={() => setActiveThreadId(thread.threadId)}
                onArchive={() =>
                  void setArchived({ id: thread._id, archived: true })
                }
                onDelete={() => void onDelete(thread._id, thread.threadId)}
              />
            ))
          )}
          {archived.length > 0 ? (
            <>
              <button
                onClick={() => setShowArchived((s) => !s)}
                className="mt-2 px-2 pb-1 text-[10px] font-medium uppercase tracking-wide text-neutral-600 hover:text-neutral-400"
              >
                Archived ({archived.length}) {showArchived ? "▾" : "▸"}
              </button>
              {showArchived
                ? archived.map((thread) => (
                    <ThreadRow
                      key={thread._id}
                      title={thread.title}
                      when={thread.lastMessageAt}
                      selected={thread.threadId === selected}
                      onOpen={() => setActiveThreadId(thread.threadId)}
                      onArchive={() =>
                        void setArchived({ id: thread._id, archived: false })
                      }
                      onDelete={() =>
                        void onDelete(thread._id, thread.threadId)
                      }
                      archivedRow
                    />
                  ))
                : null}
            </>
          ) : null}
        </div>
        <div className="border-t border-edge p-3">
          <p className="text-[10px] leading-relaxed text-neutral-600">
            Model: {provider ? PROVIDER_LABELS[provider] : "…"}
            {providerReady ? "" : " (no key set)"} ·{" "}
            <Link to="/app/settings" className="underline hover:text-accent">
              change
            </Link>
          </p>
        </div>
      </aside>

      <Conversation
        key={selected ?? "new"}
        threadId={selected}
        onThreadCreated={setActiveThreadId}
        send={send}
      />
    </div>
  );
}

function ThreadRow({
  title,
  when,
  selected,
  onOpen,
  onArchive,
  onDelete,
  archivedRow = false,
}: {
  title: string;
  when: number;
  selected: boolean;
  onOpen: () => void;
  onArchive: () => void;
  onDelete: () => void;
  archivedRow?: boolean;
}) {
  return (
    <div
      className={`group flex items-center gap-1 rounded-md px-2 py-1.5 ${
        selected ? "bg-raised" : "hover:bg-raised/60"
      }`}
    >
      <button onClick={onOpen} className="min-w-0 flex-1 text-left">
        <span className="block truncate text-xs text-neutral-300">
          {title}
        </span>
        <span className="text-[10px] text-neutral-600">{timeAgo(when)}</span>
      </button>
      <button
        onClick={onArchive}
        title={archivedRow ? "Unarchive" : "Archive"}
        className="block shrink-0 text-[10px] text-neutral-600 hover:text-neutral-300 md:hidden md:group-hover:block"
      >
        {archivedRow ? "restore" : "archive"}
      </button>
      <button
        onClick={onDelete}
        title="Delete"
        className="block shrink-0 text-[10px] text-neutral-600 hover:text-red-400 md:hidden md:group-hover:block"
      >
        delete
      </button>
    </div>
  );
}

function Conversation({
  threadId,
  onThreadCreated,
  send,
}: {
  threadId: string | null;
  onThreadCreated: (threadId: string) => void;
  send: (args: {
    threadId?: string;
    prompt: string;
  }) => Promise<string>;
}) {
  // stream: true pulls delta chunks through ask.messages, so the reply
  // renders word by word instead of landing in one block.
  const messages = useUIMessages(
    api.ask.messages,
    threadId ? { threadId } : "skip",
    { initialNumItems: 50, stream: true },
  );
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // The slash menu shows while the draft is just a command prefix.
  const slashMatches = useMemo(() => {
    if (!prompt.startsWith("/") || prompt.includes(" ")) return [];
    return SLASH_COMMANDS.filter((c) => c.command.startsWith(prompt));
  }, [prompt]);

  const submit = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setError(null);
    setPrompt("");
    try {
      const newThreadId = await send({
        threadId: threadId ?? undefined,
        prompt: trimmed,
      });
      if (!threadId) onThreadCreated(newThreadId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send");
    }
  };

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 5) return "Up late.";
    if (hour < 12) return "Good morning.";
    if (hour < 18) return "Good afternoon.";
    if (hour < 22) return "Good evening.";
    return "Working late.";
  })();

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {threadId ? (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-4">
          {messages.results?.map((message) => (
            <div
              key={message.key}
              className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm leading-relaxed ${
                message.role === "user"
                  ? "self-end bg-edge text-white"
                  : "self-start border border-edge bg-panel text-neutral-300"
              }`}
            >
              {message.parts
                .filter((part) => part.type === "text")
                .map((part, i) => (
                  <p key={i} className="whitespace-pre-wrap">
                    {(part as { text: string }).text}
                  </p>
                ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center pb-10">
          <h1 className="mb-6 text-2xl font-semibold text-white">
            {greeting} What should we research?
          </h1>
          <div className="flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => void submit(suggestion)}
                className="rounded-full border border-edge px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:border-accent hover:text-accent"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="relative">
        {slashMatches.length > 0 ? (
          <div className="absolute bottom-full left-0 mb-1 w-72 rounded-md border border-edge bg-panel p-1 shadow-xl">
            {slashMatches.map((cmd) => (
              <button
                key={cmd.command}
                onClick={() => {
                  setPrompt(cmd.template);
                  inputRef.current?.focus();
                }}
                className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs text-neutral-300 hover:bg-raised"
              >
                <span className="font-medium text-white">{cmd.command}</span>
                <span className="text-neutral-500">{cmd.hint}</span>
              </button>
            ))}
          </div>
        ) : null}
        <div className="rounded-lg border border-edge bg-panel p-3 focus-within:border-accent">
          <textarea
            ref={inputRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void submit(prompt);
              }
            }}
            rows={2}
            placeholder="Ask about the pipeline, a company, or type / for commands"
            className="w-full resize-none bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-600">
              Enter sends · Shift-Enter for a new line · / for commands
            </span>
            <button
              onClick={() => void submit(prompt)}
              disabled={!prompt.trim()}
              className="rounded-md bg-primary px-3 py-1 text-sm text-primary-ink transition-colors hover:bg-primary-hover disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </div>
        {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
      </div>
    </div>
  );
}
