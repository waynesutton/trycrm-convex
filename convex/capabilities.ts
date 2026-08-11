import { v } from "convex/values";
import { query } from "./_generated/server";
import { agentmailConfigured, resendConfigured } from "./email";
import {
  slackBotConfigured,
  slackSigningConfigured,
  slackWebhookConfigured,
} from "./slack";
import { exaConfigured, firecrawlConfigured } from "./web";

// Which optional integrations have real keys on this deployment. The
// settings screen renders these as configured or not configured badges, and
// nothing in the app pretends a missing key works.
const realKey = (value: string | undefined): boolean =>
  !!value && value !== "unset";

export const status = query({
  args: {},
  returns: v.object({
    contextDev: v.boolean(),
    openai: v.boolean(),
    anthropic: v.boolean(),
    openrouter: v.boolean(),
    grok: v.boolean(),
    deepseek: v.boolean(),
    resend: v.boolean(),
    agentmail: v.boolean(),
    firecrawl: v.boolean(),
    exa: v.boolean(),
    slackWebhook: v.boolean(),
    slackBot: v.boolean(),
    slackSigning: v.boolean(),
  }),
  handler: async () => {
    return {
      contextDev: realKey(process.env.CONTEXT_DEV_API_KEY),
      openai: realKey(process.env.OPENAI_API_KEY),
      anthropic: realKey(process.env.ANTHROPIC_API_KEY),
      openrouter: realKey(process.env.OPENROUTER_API_KEY),
      grok: realKey(process.env.GROK_API_KEY),
      deepseek: realKey(process.env.DEEPSEEK_API_KEY),
      resend: resendConfigured(),
      agentmail: agentmailConfigured(),
      firecrawl: firecrawlConfigured(),
      exa: exaConfigured(),
      slackWebhook: slackWebhookConfigured(),
      slackBot: slackBotConfigured(),
      slackSigning: slackSigningConfigured(),
    };
  },
});
