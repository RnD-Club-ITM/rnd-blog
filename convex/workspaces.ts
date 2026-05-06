import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireIdentity, requireMembership } from "./lib/auth";

const channelKind = v.union(v.literal("announcements"), v.literal("standard"));
const workspaceRole = v.union(v.literal("host"), v.literal("member"));

export const syncWorkspaceAccess = mutation({
  args: {
    workspaceId: v.string(),
    role: workspaceRole,
    memberName: v.string(),
    memberAvatarUrl: v.optional(v.string()),
    channels: v.array(
      v.object({
        slug: v.string(),
        name: v.string(),
        kind: channelKind,
        position: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);

    for (const channel of args.channels) {
      const existingChannel = await ctx.db
        .query("channels")
        .withIndex("by_workspace_slug", (query) =>
          query
            .eq("workspaceId", args.workspaceId)
            .eq("slug", channel.slug),
        )
        .unique();

      if (!existingChannel) {
        await ctx.db.insert("channels", {
          workspaceId: args.workspaceId,
          slug: channel.slug,
          name: channel.name,
          kind: channel.kind,
          position: channel.position,
          createdAt: Date.now(),
        });
        continue;
      }

      if (
        existingChannel.name !== channel.name ||
        existingChannel.kind !== channel.kind ||
        existingChannel.position !== channel.position
      ) {
        await ctx.db.patch(existingChannel._id, {
          name: channel.name,
          kind: channel.kind,
          position: channel.position,
        });
      }
    }

    const existingMembership = await ctx.db
      .query("memberships")
      .withIndex("by_workspace_user", (query) =>
        query
          .eq("workspaceId", args.workspaceId)
          .eq("userId", identity.subject),
      )
      .unique();

    if (!existingMembership) {
      await ctx.db.insert("memberships", {
        workspaceId: args.workspaceId,
        userId: identity.subject,
        role: args.role,
        active: true,
        name: args.memberName,
        avatarUrl: args.memberAvatarUrl,
        syncedAt: Date.now(),
      });
      return;
    }

    await ctx.db.patch(existingMembership._id, {
      role: args.role,
      active: true,
      name: args.memberName,
      avatarUrl: args.memberAvatarUrl,
      syncedAt: Date.now(),
    });
  },
});

export const listChannels = query({
  args: {
    workspaceId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireMembership(ctx, args.workspaceId);

    return await ctx.db
      .query("channels")
      .withIndex("by_workspace_position", (query) =>
        query.eq("workspaceId", args.workspaceId),
      )
      .collect();
  },
});

export const deactivateMember = mutation({
  args: {
    workspaceId: v.string(),
    targetUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireMembership(ctx, args.workspaceId);

    if (membership.role !== "host") {
      throw new Error("Only the project host can remove workspace members");
    }

    const targetMembership = await ctx.db
      .query("memberships")
      .withIndex("by_workspace_user", (query) =>
        query
          .eq("workspaceId", args.workspaceId)
          .eq("userId", args.targetUserId),
      )
      .unique();

    if (!targetMembership) {
      return { success: true };
    }

    if (targetMembership.role === "host") {
      throw new Error("The project host cannot be removed");
    }

    await ctx.db.patch(targetMembership._id, {
      active: false,
      syncedAt: Date.now(),
    });

    return { success: true };
  },
});
