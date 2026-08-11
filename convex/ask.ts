import {
  Agent,
  createThread,
  createTool,
  listUIMessages,
  saveMessage,
  stepCountIs,
  syncStreams,
  vStreamArgs,
} from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { z } from "zod";
import { components, internal } from "./_generated/api";
import {
  internalAction,
  internalQuery,
  query,
} from "./_generated/server";
import type { AiProvider } from "./ai";
import {
  languageModelFor,
  missingKeyMessage,
  providerConfigured,
} from "./ai";
import { agentmailConfigured, resendConfigured } from "./email";
import { logEvent } from "./logs";
import { insertActivity } from "./model/activities";
import { writeMutation } from "./model/functions";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Ask: a workspace-wide chat, not tied to one record. Threads archive and
// delete like a chat app, and the agent researches with the same tools the
// record chat uses plus a whole-CRM overview.

const crmOverview = createTool({
  description:
    "Read a summary of the whole CRM: companies, contacts, pipeline by stage, recent activity, and open agent tasks.",
  inputSchema: z.object({}),
  execute: async (ctx): Promise<string> => {
    return await ctx.runQuery(internal.ask.overview, {});
  },
});

const searchTheWeb = createTool({
  description:
    "Search the web for recent information. Returns titles, URLs, and highlights.",
  inputSchema: z.object({
    query: z.string().describe("What to search the web for"),
  }),
  execute: async (ctx, input): Promise<string> => {
    return await ctx.runAction(internal.web.searchWeb, {
      query: input.query,
    });
  },
});

const readWebPage = createTool({
  description:
    "Fetch a specific web page and return its main content as markdown.",
  inputSchema: z.object({
    url: z.string().describe("The full URL of the page to read"),
  }),
  execute: async (ctx, input): Promise<string> => {
    return await ctx.runAction(internal.web.scrapePage, { url: input.url });
  },
});

const INSTRUCTIONS = [
  "You are Ask, the workspace assistant inside an agentic CRM.",
  "Read the CRM overview before answering questions about the pipeline, and cite what you read.",
  "Nothing about a person is guessed. If you do not have the data, say so plainly.",
  "You may search the web or read a page. If a web tool reports it is not configured, tell the user which key enables it.",
  "Answer briefly and show your working.",
].join(" ");

const makeAskAgent = (provider: AiProvider) =>
  new Agent(components.agent, {
    name: "Ask",
    languageModel: languageModelFor(provider),
    instructions: INSTRUCTIONS,
    tools: {
      crm_overview: crmOverview,
      search_the_web: searchTheWeb,
      read_web_page: readWebPage,
    },
  });

// The whole CRM flattened to text for the overview tool.
export const overview = internalQuery({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    const lines: Array<string> = [];
    const companies = await ctx.db
      .query("companies")
      .withIndex("by_name")
      .take(100);
    lines.push(`Companies (${companies.length}):`);
    for (const company of companies) {
      lines.push(
        `- ${company.name} (${company.domain ?? "no domain"}), industry ${company.industry ?? "unknown"}, enrichment ${company.enrichmentStatus}`,
      );
    }
    const deals = await ctx.db.query("deals").take(200);
    lines.push(`Deals (${deals.length}):`);
    for (const deal of deals) {
      lines.push(
        `- ${deal.name}: stage ${deal.stage}, ${(deal.amountMinor / 100).toFixed(2)} ${deal.currency}`,
      );
    }
    const contacts = await ctx.db.query("contacts").take(200);
    lines.push(`Contacts (${contacts.length}):`);
    for (const contact of contacts) {
      lines.push(
        `- ${contact.name}, ${contact.title ?? "title unknown"}, ${contact.email ?? "no email"}`,
      );
    }
    const activities = await ctx.db.query("activities").order("desc").take(25);
    lines.push("Recent activity:");
    for (const activity of activities) {
      lines.push(`- ${activity.type}: ${activity.body}`);
    }
    const openTasks = await ctx.db
      .query("agentTasks")
      .withIndex("by_state_and_dueAt", (q) => q.eq("state", "open"))
      .take(25);
    lines.push(`Open agent tasks (${openTasks.length}):`);
    for (const task of openTasks) {
      lines.push(`- ${task.kind}: ${task.reason}`);
    }
    return lines.join("\n");
  },
});

export const providerInternal = internalQuery({
  args: {},
  returns: v.union(
    v.literal("openai"),
    v.literal("anthropic"),
    v.literal("openrouter"),
    v.literal("grok"),
    v.literal("deepseek"),
  ),
  handler: async (ctx) => {
    const workspace = await ctx.db.query("workspace").first();
    return workspace?.aiProvider ?? "deepseek";
  },
});

export const threads = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("askThreads"),
      threadId: v.string(),
      title: v.string(),
      archived: v.boolean(),
      lastMessageAt: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const rows = await ctx.db.query("askThreads").order("desc").take(100);
    return rows
      .map((row) => ({
        _id: row._id,
        threadId: row.threadId,
        title: row.title,
        archived: row.archived,
        lastMessageAt: row.lastMessageAt,
      }))
      .sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  },
});

// Messages plus live stream deltas, so replies render as they generate
// instead of arriving in one block.
export const messages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, args) => {
    const paginated = await listUIMessages(ctx, components.agent, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
    });
    const streams = await syncStreams(ctx, components.agent, {
      threadId: args.threadId,
      streamArgs: args.streamArgs,
    });
    return { ...paginated, streams };
  },
});

// Slash commands the CRM handles itself, no model key required. "/task" and
// "/note" write straight to the timeline; a company or contact name in the
// text links the record, "email me" schedules a reminder, and "in N days",
// "tomorrow", or an explicit date like "on Aug 15", "on 8/15", or
// "on 2026-08-15" sets the due date.
const parseSlashCommand = (
  prompt: string,
): { type: "TASK" | "NOTE"; body: string } | null => {
  const match = prompt.match(/^\/(task|note)\s+(.+)$/is);
  if (!match) return null;
  return {
    type: match[1].toUpperCase() as "TASK" | "NOTE",
    body: match[2].trim(),
  };
};

const MONTH_PREFIXES = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
] as const;

// The server has no user timezone, so explicit dates land at 16:00 UTC:
// mid-morning in the US, evening in Europe.
const DUE_HOUR_UTC = 16;

const atUtc = (
  year: number,
  monthIndex: number,
  day: number,
): number | null => {
  if (monthIndex < 0 || monthIndex > 11 || day < 1 || day > 31) return null;
  const timestamp = Date.UTC(year, monthIndex, day, DUE_HOUR_UTC);
  // Reject overflow like Feb 31 rolling into March.
  return new Date(timestamp).getUTCDate() === day ? timestamp : null;
};

// A month-day phrase without a year rolls forward once it has passed.
const upcomingUtc = (monthIndex: number, day: number): number | null => {
  const year = new Date().getUTCFullYear();
  const thisYear = atUtc(year, monthIndex, day);
  if (thisYear === null) return null;
  return thisYear >= Date.now() ? thisYear : atUtc(year + 1, monthIndex, day);
};

// "on 2026-08-15", "on 8/15", "on 8/15/2026", "on Aug 15", "on August 15, 2026".
const parseExplicitDueAt = (body: string): number | null => {
  const iso = body.match(/\bon\s+(\d{4})-(\d{1,2})-(\d{1,2})\b/i);
  if (iso) {
    return atUtc(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  }
  const slash = body.match(/\bon\s+(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?\b/i);
  if (slash) {
    const monthIndex = Number(slash[1]) - 1;
    const day = Number(slash[2]);
    return slash[3]
      ? atUtc(Number(slash[3]), monthIndex, day)
      : upcomingUtc(monthIndex, day);
  }
  const named = body.match(
    /\bon\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?\b/i,
  );
  if (named) {
    const monthIndex = MONTH_PREFIXES.indexOf(
      named[1].toLowerCase() as (typeof MONTH_PREFIXES)[number],
    );
    const day = Number(named[2]);
    return named[3]
      ? atUtc(Number(named[3]), monthIndex, day)
      : upcomingUtc(monthIndex, day);
  }
  return null;
};

const parseDueAt = (body: string): { dueAt: number; explicit: boolean } => {
  const explicit = parseExplicitDueAt(body);
  if (explicit !== null) return { dueAt: explicit, explicit: true };
  const day = 86_400_000;
  const inDays = body.match(/\bin\s+(\d+)\s+days?\b/i);
  if (inDays) {
    return { dueAt: Date.now() + Number(inDays[1]) * day, explicit: false };
  }
  if (/\btoday\b/i.test(body)) {
    return { dueAt: Date.now() + 4 * 60 * 60 * 1000, explicit: false };
  }
  return { dueAt: Date.now() + day, explicit: false };
};

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const formatUtcDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const suffix = year === new Date().getUTCFullYear() ? "" : `, ${year}`;
  return `${MONTH_LABELS[date.getUTCMonth()]} ${date.getUTCDate()}${suffix}`;
};

async function matchRecord(
  ctx: MutationCtx,
  body: string,
): Promise<{ companyId?: Id<"companies">; contactId?: Id<"contacts"> }> {
  const lower = body.toLowerCase();
  const companies = await ctx.db
    .query("companies")
    .withIndex("by_name")
    .take(100);
  const company = companies.find((row) =>
    lower.includes(row.name.toLowerCase()),
  );
  if (company) return { companyId: company._id };
  const contacts = await ctx.db.query("contacts").take(200);
  const contact = contacts.find((row) =>
    lower.includes(row.name.toLowerCase()),
  );
  if (contact) return { contactId: contact._id };
  return {};
}

async function runSlashCommand(
  ctx: MutationCtx,
  threadId: string,
  command: { type: "TASK" | "NOTE"; body: string },
): Promise<void> {
  const record = await matchRecord(ctx, command.body);
  const remindMe =
    command.type === "TASK" && /\bemail\s+me\b/i.test(command.body);
  const due = command.type === "TASK" ? parseDueAt(command.body) : undefined;
  const { recordName, reminderScheduled } = await insertActivity(ctx, {
    type: command.type,
    body: command.body,
    ...record,
    dueAt: due?.dueAt,
    remindMe,
  });

  const workspace = await ctx.db.query("workspace").first();
  const emailProvider = workspace?.emailProvider ?? "resend";
  const emailReady =
    emailProvider === "agentmail" ? agentmailConfigured() : resendConfigured();

  const lines: Array<string> = [];
  lines.push(
    `${command.type === "TASK" ? "Task" : "Note"} added${recordName ? ` to ${recordName}` : ""}.`,
  );
  if (command.type === "TASK" && due) {
    if (due.explicit) {
      lines.push(`Due ${formatUtcDate(due.dueAt)}.`);
    } else {
      const days = Math.max(
        1,
        Math.round((due.dueAt - Date.now()) / 86_400_000),
      );
      lines.push(`Due in about ${days} day${days === 1 ? "" : "s"}.`);
    }
  }
  if (remindMe) {
    if (!reminderScheduled) {
      lines.push("No user with an email exists yet, so no reminder was set.");
    } else if (emailReady) {
      lines.push(
        `A reminder email is scheduled via ${emailProvider === "agentmail" ? "AgentMail" : "Resend"}.`,
      );
    } else {
      lines.push(
        "A reminder is scheduled, but no email key is configured, so the send will log a skip. Add RESEND_API_KEY or the AgentMail keys to enable it.",
      );
    }
  }
  lines.push("You can see it on the record timeline and the Activity page.");

  await saveMessage(ctx, components.agent, {
    threadId,
    agentName: "Ask",
    message: { role: "assistant", content: lines.join(" ") },
  });
  await logEvent(ctx, {
    kind: "M",
    fn: "ask:command",
    status: "success",
    message: `/${command.type.toLowerCase()}${recordName ? ` on ${recordName}` : ""}: ${command.body.slice(0, 60)}`,
  });
}

// Send a prompt. Creates the thread on first use, titled by the first
// prompt. The reply generates asynchronously and streams in reactively.
export const send = writeMutation({
  args: {
    threadId: v.optional(v.string()),
    prompt: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const prompt = args.prompt.trim();
    if (prompt.length === 0) throw new Error("Ask something first");

    let threadId = args.threadId;
    if (threadId) {
      const row = await ctx.db
        .query("askThreads")
        .withIndex("by_threadId", (q) => q.eq("threadId", threadId!))
        .first();
      if (!row) threadId = undefined;
      else {
        await ctx.db.patch("askThreads", row._id, {
          lastMessageAt: Date.now(),
        });
      }
    }
    if (!threadId) {
      threadId = await createThread(ctx, components.agent, {
        title: "Ask",
      });
      await ctx.db.insert("askThreads", {
        threadId,
        title: prompt.length > 60 ? `${prompt.slice(0, 60)}…` : prompt,
        archived: false,
        lastMessageAt: Date.now(),
      });
    }
    const { messageId } = await saveMessage(ctx, components.agent, {
      threadId,
      prompt,
    });
    await logEvent(ctx, {
      kind: "M",
      fn: "ask:send",
      status: "success",
      message:
        prompt.length > 80 ? `${prompt.slice(0, 80)}…` : prompt,
    });
    // /task and /note run in this same transaction, no model involved.
    const command = parseSlashCommand(prompt);
    if (command) {
      await runSlashCommand(ctx, threadId, command);
      return threadId;
    }
    await ctx.scheduler.runAfter(0, internal.ask.generate, {
      threadId,
      promptMessageId: messageId,
    });
    return threadId;
  },
});

export const setArchived = writeMutation({
  args: { id: v.id("askThreads"), archived: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch("askThreads", args.id, { archived: args.archived });
    return null;
  },
});

export const remove = writeMutation({
  args: { id: v.id("askThreads") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete("askThreads", args.id);
    return null;
  },
});

export const generate = internalAction({
  args: { threadId: v.string(), promptMessageId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const provider: AiProvider = await ctx.runQuery(
      internal.ask.providerInternal,
      {},
    );
    // Without a key for the chosen provider, say so instead of pretending.
    if (!providerConfigured(provider)) {
      await saveMessage(ctx, components.agent, {
        threadId: args.threadId,
        agentName: "Ask",
        message: {
          role: "assistant",
          content: missingKeyMessage(provider),
        },
      });
      await ctx.runMutation(internal.logs.record, {
        kind: "A",
        fn: "ask:generate",
        status: "info",
        message: `No ${provider} key configured; replied with setup note`,
      });
      return null;
    }
    const agent = makeAskAgent(provider);
    try {
      // Deltas save as they generate; the messages query streams them out.
      const result = await agent.streamText(
        ctx,
        { threadId: args.threadId },
        {
          promptMessageId: args.promptMessageId,
          stopWhen: stepCountIs(6),
        },
        { saveStreamDeltas: true },
      );
      await result.consumeStream();
      await ctx.runMutation(internal.logs.record, {
        kind: "A",
        fn: "ask:generate",
        status: "success",
        message: `Reply generated via ${provider}`,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Generation failed";
      await saveMessage(ctx, components.agent, {
        threadId: args.threadId,
        agentName: "Ask",
        message: {
          role: "assistant",
          content: `The model call failed: ${message}`,
        },
      });
      await ctx.runMutation(internal.logs.record, {
        kind: "A",
        fn: "ask:generate",
        status: "error",
        message,
      });
    }
    return null;
  },
});
