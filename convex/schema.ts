import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Deal stages carried over from upstream.
export const dealStage = v.union(
  v.literal("QUALIFIED"),
  v.literal("MEETING"),
  v.literal("PROPOSAL"),
  v.literal("NEGOTIATION"),
  v.literal("CLOSED_WON"),
  v.literal("CLOSED_LOST"),
);

export const activityType = v.union(
  v.literal("NOTE"),
  v.literal("CALL"),
  v.literal("EMAIL"),
  v.literal("MEETING"),
  v.literal("TASK"),
  v.literal("STAGE_CHANGE"),
  v.literal("ENRICHMENT"),
);

export const enrichmentStatus = v.union(
  v.literal("NONE"),
  v.literal("RESEARCHING"),
  v.literal("ENRICHED"),
  v.literal("FAILED"),
);

// Evidence bands from the upstream evidence ledger. Strong evidence writes to
// the record, weak evidence becomes a suggestion a human settles.
export const evidenceBand = v.union(
  v.literal("CONFIRMED"),
  v.literal("PROBABLE"),
  v.literal("POSSIBLE"),
  v.literal("WEAK"),
);

export default defineSchema({
  // Single tenant, on purpose. One row.
  workspace: defineTable({
    name: v.string(),
    demoMode: v.boolean(),
    // Sign-in allow list. Empty means nobody signs in, the safe direction to
    // fail. Unused while demoMode is true.
    allowedSignIn: v.array(v.string()),
    reportingCurrency: v.string(),
    agentModel: v.string(),
    lastResetAt: v.number(),
    // Which provider outbound notifications use. Resend is the default;
    // AgentMail adds a persistent inbox agents can also receive on. Optional
    // so existing rows keep working; undefined means "resend".
    emailProvider: v.optional(
      v.union(v.literal("resend"), v.literal("agentmail")),
    ),
    // Compose email configuration: the from identity and a signature that
    // appends to every outbound message. All optional; sends fall back to
    // a generic from line until these are set.
    emailFromName: v.optional(v.string()),
    emailFromAddress: v.optional(v.string()),
    emailSignature: v.optional(v.string()),
    // Which model provider the chat surfaces use. All optional keys; the
    // reply names the missing key when the chosen provider is not configured.
    aiProvider: v.optional(
      v.union(
        v.literal("openai"),
        v.literal("anthropic"),
        v.literal("openrouter"),
        v.literal("grok"),
        v.literal("deepseek"),
      ),
    ),
    // Sidebar personalization: item ids in display order, and ids hidden by
    // the Settings page. Both reset with the demo like everything else.
    sidebarOrder: v.optional(v.array(v.string())),
    sidebarHidden: v.optional(v.array(v.string())),
    // Slack integration. Everything optional and off by default; the env
    // vars (SLACK_WEBHOOK_URL, SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET) live on
    // the deployment, these rows hold the workspace preferences.
    slackEnabled: v.optional(v.boolean()),
    slackNotifyRecords: v.optional(v.boolean()),
    slackNotifyDeals: v.optional(v.boolean()),
    slackNotifyTasks: v.optional(v.boolean()),
    slackNotifyAgent: v.optional(v.boolean()),
    // Channel ID (bot token mode) plus the display name for the settings UI.
    // Webhook mode ignores both: the channel is baked into the URL.
    slackChannelId: v.optional(v.string()),
    slackChannelName: v.optional(v.string()),
    // The /crm agent bot toggle, and an optional email domain that widens
    // the Slack user match beyond the exact team member emails.
    slackBotEnabled: v.optional(v.boolean()),
    slackAllowedEmailDomain: v.optional(v.string()),
  }),

  // Workspace members. Demo seeds these; with Convex Auth enabled this table
  // maps to authenticated users.
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("owner"), v.literal("member")),
    avatarUrl: v.optional(v.string()),
  }).index("by_email", ["email"]),

  companies: defineTable({
    name: v.string(),
    domain: v.optional(v.string()),
    industry: v.optional(v.string()),
    description: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    ownerId: v.optional(v.id("users")),
    primaryContactId: v.optional(v.id("contacts")),
    enrichmentStatus: enrichmentStatus,
    lastActivityAt: v.optional(v.number()),
  })
    .index("by_domain", ["domain"])
    .index("by_name", ["name"])
    .searchIndex("search_name", { searchField: "name" }),

  contacts: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    title: v.optional(v.string()),
    companyId: v.optional(v.id("companies")),
    ownerId: v.optional(v.id("users")),
    avatarUrl: v.optional(v.string()),
    lastActivityAt: v.optional(v.number()),
  })
    .index("by_company", ["companyId"])
    .index("by_email", ["email"])
    .searchIndex("search_name", { searchField: "name" }),

  deals: defineTable({
    name: v.string(),
    companyId: v.id("companies"),
    stage: dealStage,
    // Money is integer minor units. Round once, at the boundary.
    amountMinor: v.number(),
    currency: v.string(),
    ownerId: v.optional(v.id("users")),
    primaryContactId: v.optional(v.id("contacts")),
    expectedCloseAt: v.optional(v.number()),
    closedAt: v.optional(v.number()),
  })
    .index("by_company", ["companyId"])
    .index("by_stage", ["stage"])
    .index("by_owner", ["ownerId"])
    .searchIndex("search_name", { searchField: "name" }),

  // Timeline entries for companies, contacts, and deals.
  activities: defineTable({
    type: activityType,
    body: v.string(),
    companyId: v.optional(v.id("companies")),
    contactId: v.optional(v.id("contacts")),
    dealId: v.optional(v.id("deals")),
    authorId: v.optional(v.id("users")),
    // Tasks
    dueAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    // Stage changes
    meta: v.optional(
      v.object({
        fromStage: v.optional(v.string()),
        toStage: v.optional(v.string()),
      }),
    ),
  })
    .index("by_company", ["companyId"])
    .index("by_contact", ["contactId"])
    .index("by_deal", ["dealId"])
    .index("by_type", ["type"]),

  // Custom fields per entity, with an agentFilled flag and an agentBrief that
  // tells the agent what to put in a field.
  fieldDefinitions: defineTable({
    entity: v.union(
      v.literal("company"),
      v.literal("contact"),
      v.literal("deal"),
    ),
    key: v.string(),
    label: v.string(),
    type: v.union(
      v.literal("text"),
      v.literal("number"),
      v.literal("select"),
      v.literal("date"),
    ),
    options: v.optional(v.array(v.string())),
    order: v.number(),
    archived: v.boolean(),
    agentFilled: v.boolean(),
    agentBrief: v.optional(v.string()),
  }).index("by_entity_and_key", ["entity", "key"]),

  // Per-entity table preferences and record defaults, one row per entity.
  // Column prefs are stored sparsely: only keys the user touched appear, and
  // the array order is the display order. Unknown keys are ignored on read so
  // renamed or archived fields degrade cleanly.
  tableSettings: defineTable({
    entity: v.union(
      v.literal("company"),
      v.literal("contact"),
      v.literal("deal"),
    ),
    columns: v.array(
      v.object({
        key: v.string(),
        label: v.optional(v.string()),
        hidden: v.optional(v.boolean()),
        pinned: v.optional(v.boolean()),
      }),
    ),
    defaultOwnerId: v.optional(v.id("users")),
    defaultIndustry: v.optional(v.string()),
    defaultStage: v.optional(dealStage),
    defaultCurrency: v.optional(v.string()),
    autoEnrich: v.optional(v.boolean()),
  }).index("by_entity", ["entity"]),

  fieldValues: defineTable({
    fieldId: v.id("fieldDefinitions"),
    // The record this value belongs to, as a string id into companies,
    // contacts, or deals.
    entityId: v.string(),
    value: v.string(),
  })
    .index("by_entityId", ["entityId"])
    .index("by_field_and_entityId", ["fieldId", "entityId"]),

  // The agent work queue. The queue is a table: claimDue is a mutation that
  // reads by index and writes a lease, and Convex serializes mutations so two
  // dispatchers claim disjoint work with no lock hint.
  agentTasks: defineTable({
    kind: v.union(
      v.literal("ENRICH_COMPANY"),
      v.literal("RECHECK_CONTACT"),
      v.literal("BRIEF_OWNER"),
      v.literal("CUSTOM"),
    ),
    // state is denormalized on purpose: indexes cannot express
    // "where finishedAt is null", so state carries that as an indexed value.
    state: v.union(v.literal("open"), v.literal("done"), v.literal("failed")),
    reason: v.string(),
    companyId: v.optional(v.id("companies")),
    contactId: v.optional(v.id("contacts")),
    dealId: v.optional(v.id("deals")),
    priority: v.number(),
    dueAt: v.number(),
    leasedUntil: v.optional(v.number()),
    attempts: v.number(),
    startedAt: v.optional(v.number()),
    finishedAt: v.optional(v.number()),
    result: v.optional(v.string()),
  })
    .index("by_state_and_dueAt", ["state", "dueAt"])
    .index("by_company", ["companyId"])
    .index("by_contact", ["contactId"]),

  // Agent builder: definitions are data, versions are rows, deploying is a
  // pointer move. No build, no redeploy.
  agentDefinitions: defineTable({
    name: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("deployed"),
      v.literal("paused"),
      v.literal("archived"),
    ),
    currentVersionId: v.optional(v.id("agentVersions")),
    trigger: v.object({
      kind: v.union(
        v.literal("manual"),
        v.literal("schedule"),
        v.literal("event"),
      ),
      cronspec: v.optional(v.string()),
      event: v.optional(v.string()),
    }),
  }),

  agentVersions: defineTable({
    agentId: v.id("agentDefinitions"),
    number: v.number(),
    instructions: v.string(),
    // The manifest names which of the compiled tools a version may call, so
    // an agent built in the UI cannot invent a tool that does not exist.
    toolNames: v.array(v.string()),
    model: v.string(),
    deployedAt: v.optional(v.number()),
  }).index("by_agent_and_number", ["agentId", "number"]),

  agentRuns: defineTable({
    agentId: v.optional(v.id("agentDefinitions")),
    taskId: v.optional(v.id("agentTasks")),
    companyId: v.optional(v.id("companies")),
    contactId: v.optional(v.id("contacts")),
    status: v.union(
      v.literal("running"),
      v.literal("done"),
      v.literal("failed"),
    ),
    startedAt: v.number(),
    finishedAt: v.optional(v.number()),
    steps: v.array(
      v.object({
        at: v.number(),
        kind: v.union(
          v.literal("plan"),
          v.literal("tool"),
          v.literal("observation"),
          v.literal("discard"),
          v.literal("write"),
          v.literal("question"),
        ),
        text: v.string(),
      }),
    ),
    inputTokens: v.optional(v.number()),
    outputTokens: v.optional(v.number()),
  })
    .index("by_agent", ["agentId"])
    .index("by_company", ["companyId"])
    .index("by_contact", ["contactId"]),

  // The evidence ledger. Tools report what they observed; the ledger prices
  // the observation and decides the band. No tool accepts a confidence score.
  facts: defineTable({
    entityType: v.union(
      v.literal("company"),
      v.literal("contact"),
      v.literal("deal"),
    ),
    entityId: v.string(),
    field: v.string(),
    value: v.string(),
    evidenceKind: v.string(),
    band: evidenceBand,
    sourceUrl: v.optional(v.string()),
    // Weak evidence becomes a suggestion a human settles.
    settled: v.union(
      v.literal("written"),
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected"),
    ),
  }).index("by_entityId", ["entityId"]),

  // Workspace-wide Ask chats, mapped to Agent component threads. Unlike
  // chatThreads these are not tied to a record: archive and delete are
  // first-class, like a chat app.
  askThreads: defineTable({
    threadId: v.string(),
    title: v.string(),
    archived: v.boolean(),
    lastMessageAt: v.number(),
  }).index("by_threadId", ["threadId"]),

  // The activity log the Activity page renders, in the shape of the Convex
  // dashboard logs: one row per notable function outcome. Bounded by the
  // demo reset and the Clear button.
  logEvents: defineTable({
    kind: v.union(v.literal("M"), v.literal("A"), v.literal("C")),
    fn: v.string(),
    status: v.union(
      v.literal("success"),
      v.literal("error"),
      v.literal("info"),
    ),
    message: v.string(),
  }),

  // Verified Slack users. The /crm bot maps a Slack user id to a workspace
  // member by email (users.info via the bot token) and caches the match
  // here. Rows older than 30 days re-verify so departed teammates age out.
  slackIdentities: defineTable({
    slackUserId: v.string(),
    email: v.string(),
    name: v.string(),
    verifiedAt: v.number(),
  }).index("by_slackUserId", ["slackUserId"]),

  // Per-record agent chat threads, mapped to Agent component threads.
  chatThreads: defineTable({
    threadId: v.string(),
    companyId: v.optional(v.id("companies")),
    contactId: v.optional(v.id("contacts")),
    dealId: v.optional(v.id("deals")),
  })
    .index("by_company", ["companyId"])
    .index("by_contact", ["contactId"])
    .index("by_deal", ["dealId"])
    .index("by_threadId", ["threadId"]),
});
