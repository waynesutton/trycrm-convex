import { v } from "convex/values";
import { query } from "./_generated/server";
import { writeMutation } from "./model/functions";

// Sidebar personalization and the AI provider choice live on the workspace
// row, so they reset with the demo like everything else.

const aiProviderValidator = v.union(
  v.literal("openai"),
  v.literal("anthropic"),
  v.literal("openrouter"),
  v.literal("grok"),
  v.literal("deepseek"),
);

export const sidebar = query({
  args: {},
  returns: v.object({
    order: v.union(v.array(v.string()), v.null()),
    hidden: v.array(v.string()),
  }),
  handler: async (ctx) => {
    const workspace = await ctx.db.query("workspace").first();
    return {
      order: workspace?.sidebarOrder ?? null,
      hidden: workspace?.sidebarHidden ?? [],
    };
  },
});

export const setSidebarOrder = writeMutation({
  args: { order: v.array(v.string()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const workspace = await ctx.db.query("workspace").first();
    if (!workspace) return null;
    await ctx.db.patch("workspace", workspace._id, {
      sidebarOrder: args.order,
    });
    return null;
  },
});

export const setSidebarHidden = writeMutation({
  args: { hidden: v.array(v.string()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const workspace = await ctx.db.query("workspace").first();
    if (!workspace) return null;
    await ctx.db.patch("workspace", workspace._id, {
      sidebarHidden: args.hidden,
    });
    return null;
  },
});

export const aiProvider = query({
  args: {},
  returns: aiProviderValidator,
  handler: async (ctx) => {
    const workspace = await ctx.db.query("workspace").first();
    return workspace?.aiProvider ?? "deepseek";
  },
});

export const setAiProvider = writeMutation({
  args: { provider: aiProviderValidator },
  returns: v.null(),
  handler: async (ctx, args) => {
    const workspace = await ctx.db.query("workspace").first();
    if (!workspace) return null;
    await ctx.db.patch("workspace", workspace._id, {
      aiProvider: args.provider,
    });
    return null;
  },
});
