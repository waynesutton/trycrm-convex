import { anthropic } from "@ai-sdk/anthropic";
import { createOpenAI, openai } from "@ai-sdk/openai";
import type { LanguageModelV3 } from "@ai-sdk/provider";

// One place decides which model the chat surfaces run on. The workspace row
// stores the choice; the env decides whether it is usable. None of these keys
// ship by default: a fork answers with the missing key's name instead of
// erroring, same as every other integration here.
export type AiProvider =
  | "openai"
  | "anthropic"
  | "openrouter"
  | "grok"
  | "deepseek";

const realKey = (value: string | undefined): boolean =>
  !!value && value !== "unset";

export const AI_KEY_NAMES: Record<AiProvider, string> = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  openrouter: "OPENROUTER_API_KEY",
  grok: "GROK_API_KEY",
  deepseek: "DEEPSEEK_API_KEY",
};

export const providerConfigured = (provider: AiProvider): boolean => {
  if (provider === "openai") return realKey(process.env.OPENAI_API_KEY);
  if (provider === "anthropic") return realKey(process.env.ANTHROPIC_API_KEY);
  if (provider === "openrouter") return realKey(process.env.OPENROUTER_API_KEY);
  if (provider === "grok") return realKey(process.env.GROK_API_KEY);
  return realKey(process.env.DEEPSEEK_API_KEY);
};

// OpenRouter, xAI's Grok, and DeepSeek all speak the OpenAI wire format, so
// none needs an extra dependency: point the OpenAI provider at their base URL.
// The *_API_BASE_URL and *_MODEL variables override the defaults for
// compatible gateways.
export const languageModelFor = (provider: AiProvider): LanguageModelV3 => {
  if (provider === "anthropic") {
    return anthropic.chat("claude-sonnet-4-5");
  }
  if (provider === "openrouter") {
    const openrouter = createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });
    return openrouter.chat("openai/gpt-5-mini");
  }
  if (provider === "grok") {
    const grok = createOpenAI({
      baseURL: process.env.GROK_API_BASE_URL ?? "https://api.x.ai/v1",
      apiKey: process.env.GROK_API_KEY,
    });
    return grok.chat(process.env.GROK_MODEL ?? "grok-4.5");
  }
  if (provider === "deepseek") {
    const deepseek = createOpenAI({
      baseURL:
        process.env.DEEPSEEK_API_BASE_URL ?? "https://api.deepseek.com/v1",
      apiKey: process.env.DEEPSEEK_API_KEY,
    });
    return deepseek.chat(process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash");
  }
  return openai.chat("gpt-5-mini");
};

export const missingKeyMessage = (provider: AiProvider): string =>
  [
    `The ${provider} provider is selected but ${AI_KEY_NAMES[provider]} is not set on this deployment, so I cannot reason over your data.`,
    `Set it with: npx convex env set ${AI_KEY_NAMES[provider]} <your key>`,
    "You can switch providers on the Settings page. Everything else in the CRM keeps working without a model key.",
  ].join(" ");
