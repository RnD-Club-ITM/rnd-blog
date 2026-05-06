import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireMembership } from "./lib/auth";

export const list = query({
  args: {
    workspaceId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireMembership(ctx, args.workspaceId);

    return await ctx.db
      .query("workspaceResources")
      .withIndex("by_workspace_created_at", (query) =>
        query.eq("workspaceId", args.workspaceId),
      )
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    workspaceId: v.string(),
    title: v.string(),
    url: v.string(),
    description: v.optional(v.string()),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { identity, membership } = await requireMembership(ctx, args.workspaceId);

    const title = args.title.trim();
    const url = args.url.trim();
    const description = args.description?.trim() || "Shared with the workspace.";

    if (!title) {
      throw new Error("Resource title cannot be empty");
    }

    if (!url) {
      throw new Error("Resource URL cannot be empty");
    }

    const createdAt = Date.now();

    return await ctx.db.insert("workspaceResources", {
      workspaceId: args.workspaceId,
      title,
      url,
      type: args.type?.trim() || "Link",
      description,
      createdAt,
      createdBy: identity.subject,
      createdByName: membership.name,
    });
  },
});

export const remove = mutation({
  args: {
    workspaceId: v.string(),
    resourceId: v.id("workspaceResources"),
  },
  handler: async (ctx, args) => {
    const { identity, membership } = await requireMembership(ctx, args.workspaceId);

    const resource = await ctx.db.get(args.resourceId);
    if (!resource || resource.workspaceId !== args.workspaceId) {
      throw new Error("Resource not found");
    }

    const canDelete =
      membership.role === "host" || resource.createdBy === identity.subject;

    if (!canDelete) {
      throw new Error("You are not allowed to delete this resource");
    }

    await ctx.db.delete(args.resourceId);
  },
});
