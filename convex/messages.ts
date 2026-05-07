import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { requireMembership } from "./lib/auth";

const MAX_MESSAGE_LENGTH = 2000;
const ALLOWED_REACTIONS = ["👍", "❤️", "😂", "🎉", "👀"] as const;
const attachmentValidator = v.object({
  publicId: v.string(),
  url: v.string(),
  previewUrl: v.optional(v.string()),
  fileName: v.string(),
  fileType: v.string(),
  fileSize: v.number(),
  resourceType: v.string(),
});

type DbCtx = QueryCtx | MutationCtx;

async function getChannelBySlug(
  ctx: DbCtx,
  workspaceId: string,
  channelSlug: string,
) {
  return await ctx.db
    .query("channels")
    .withIndex("by_workspace_slug", (q) =>
      q.eq("workspaceId", workspaceId).eq("slug", channelSlug),
    )
    .unique();
}

async function getMessageById(ctx: DbCtx, messageId: Id<"messages">) {
  return await ctx.db.get(messageId);
}

async function getUnreadCountForChannel(
  ctx: QueryCtx,
  channelId: Id<"channels">,
  currentUserId: string,
  lastReadAt: number,
) {
  const messages = await ctx.db
    .query("messages")
    .withIndex("by_channel_created", (q) =>
      q.eq("channelId", channelId).gt("createdAt", lastReadAt),
    )
    .collect();

  return messages.filter((message) => message.authorClerkId !== currentUserId).length;
}

async function getGroupedReactions(
  ctx: QueryCtx,
  messageId: Id<"messages">,
  currentUserId: string,
) {
  const reactions = await ctx.db
    .query("messageReactions")
    .withIndex("by_message", (q) => q.eq("messageId", messageId))
    .collect();

  const grouped = new Map<
    string,
    {
      emoji: string;
      count: number;
      reactedByMe: boolean;
    }
  >();

  for (const emoji of ALLOWED_REACTIONS) {
    grouped.set(emoji, {
      emoji,
      count: 0,
      reactedByMe: false,
    });
  }

  for (const reaction of reactions) {
    const entry = grouped.get(reaction.emoji);
    if (!entry) continue;
    entry.count += 1;
    if (reaction.userId === currentUserId) {
      entry.reactedByMe = true;
    }
  }

  return Array.from(grouped.values()).filter((entry) => entry.count > 0);
}

async function enrichMessage(
  ctx: QueryCtx,
  message: Doc<"messages">,
  currentUserId: string,
) {
  return {
    ...message,
    reactions: message.isDeleted
      ? []
      : await getGroupedReactions(ctx, message._id, currentUserId),
  };
}

async function createMessageRecord(
  ctx: MutationCtx,
  args: {
    workspaceId: string;
    channelSlug: string;
    body: string;
    clientMessageId: string;
    attachment?: {
      publicId: string;
      url: string;
      previewUrl?: string;
      fileName: string;
      fileType: string;
      fileSize: number;
      resourceType: string;
    };
  },
) {
  const { identity, membership } = await requireMembership(ctx, args.workspaceId);
  const trimmedBody = args.body.trim();

  if (!trimmedBody && !args.attachment) {
    throw new Error("Message cannot be empty");
  }

  if (trimmedBody.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`);
  }

  const channel = await getChannelBySlug(ctx, args.workspaceId, args.channelSlug);
  if (!channel) {
    throw new Error("Channel not found");
  }

  if (channel.kind === "announcements" && membership.role !== "host") {
    throw new Error("Only the workspace host can post in announcements");
  }

  const existingMessage = await ctx.db
    .query("messages")
    .withIndex("by_channel_author_client", (query) =>
      query
        .eq("channelId", channel._id)
        .eq("authorClerkId", identity.subject)
        .eq("clientMessageId", args.clientMessageId),
    )
    .unique();

  if (existingMessage) {
    return {
      messageId: existingMessage._id,
      createdAt: existingMessage.createdAt,
    };
  }

  const createdAt = Date.now();
  const messageId = await ctx.db.insert("messages", {
    workspaceId: args.workspaceId,
    channelId: channel._id,
    channelSlug: args.channelSlug,
    body: trimmedBody,
    authorClerkId: identity.subject,
    authorName: membership.name,
    authorAvatarUrl: membership.avatarUrl,
    clientMessageId: args.clientMessageId,
    createdAt,
    isDeleted: false,
    attachment: args.attachment,
  });

  return {
    messageId,
    createdAt,
  };
}

export const list = query({
  args: {
    workspaceId: v.string(),
    channelSlug: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const { identity } = await requireMembership(ctx, args.workspaceId);

    const channel = await getChannelBySlug(ctx, args.workspaceId, args.channelSlug);
    if (!channel) {
      throw new Error("Channel not found");
    }

    const result = await ctx.db
      .query("messages")
      .withIndex("by_channel_created", (query) => query.eq("channelId", channel._id))
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...result,
      page: await Promise.all(
        result.page.map((message) => enrichMessage(ctx, message, identity.subject)),
      ),
    };
  },
});

export const unreadSummary = query({
  args: {
    workspaceId: v.string(),
  },
  handler: async (ctx, args) => {
    const { identity } = await requireMembership(ctx, args.workspaceId);

    const channels = await ctx.db
      .query("channels")
      .withIndex("by_workspace_position", (query) =>
        query.eq("workspaceId", args.workspaceId),
      )
      .collect();

    const readRecords = await ctx.db
      .query("messageReads")
      .withIndex("by_workspace_user", (query) =>
        query.eq("workspaceId", args.workspaceId).eq("userId", identity.subject),
      )
      .collect();

    const readMap = new Map(
      readRecords.map((record) => [record.channelSlug, record.lastReadAt]),
    );

    return await Promise.all(
      channels.map(async (channel) => {
        const lastReadAt = readMap.get(channel.slug) ?? 0;
        const latestMessage = await ctx.db
          .query("messages")
          .withIndex("by_channel_created", (query) =>
            query.eq("channelId", channel._id),
          )
          .order("desc")
          .first();

        const unreadCount = latestMessage
          ? await getUnreadCountForChannel(
              ctx,
              channel._id,
              identity.subject,
              lastReadAt,
            )
          : 0;

        return {
          channelSlug: channel.slug,
          lastReadAt,
          latestMessageAt: latestMessage?.createdAt,
          unreadCount,
        };
      }),
    );
  },
});

export const markRead = mutation({
  args: {
    workspaceId: v.string(),
    channelSlug: v.string(),
    readAt: v.number(),
  },
  handler: async (ctx, args) => {
    const { identity } = await requireMembership(ctx, args.workspaceId);

    const channel = await getChannelBySlug(ctx, args.workspaceId, args.channelSlug);
    if (!channel) {
      throw new Error("Channel not found");
    }

    const existingRecord = await ctx.db
      .query("messageReads")
      .withIndex("by_workspace_user_channel", (query) =>
        query
          .eq("workspaceId", args.workspaceId)
          .eq("userId", identity.subject)
          .eq("channelSlug", args.channelSlug),
      )
      .unique();

    const nextReadAt = Math.max(existingRecord?.lastReadAt ?? 0, args.readAt);

    if (!existingRecord) {
      await ctx.db.insert("messageReads", {
        workspaceId: args.workspaceId,
        channelSlug: args.channelSlug,
        userId: identity.subject,
        lastReadAt: nextReadAt,
        updatedAt: Date.now(),
      });
      return;
    }

    if (nextReadAt === existingRecord.lastReadAt) {
      return;
    }

    await ctx.db.patch(existingRecord._id, {
      lastReadAt: nextReadAt,
      updatedAt: Date.now(),
    });
  },
});

export const send = mutation({
  args: {
    workspaceId: v.string(),
    channelSlug: v.string(),
    body: v.string(),
    clientMessageId: v.string(),
  },
  handler: async (ctx, args) => {
    return await createMessageRecord(ctx, args);
  },
});

export const createAttachmentMessage = mutation({
  args: {
    workspaceId: v.string(),
    channelSlug: v.string(),
    body: v.string(),
    clientMessageId: v.string(),
    attachment: attachmentValidator,
  },
  handler: async (ctx, args) => {
    return await createMessageRecord(ctx, args);
  },
});

export const editMessage = mutation({
  args: {
    workspaceId: v.string(),
    messageId: v.id("messages"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const { identity } = await requireMembership(ctx, args.workspaceId);
    const message = await getMessageById(ctx, args.messageId);

    if (!message || message.workspaceId !== args.workspaceId) {
      throw new Error("Message not found");
    }

    if (message.authorClerkId !== identity.subject) {
      throw new Error("You can only edit your own messages");
    }

    if (message.isDeleted) {
      throw new Error("Deleted messages cannot be edited");
    }

    const trimmedBody = args.body.trim();
    if (!trimmedBody) {
      throw new Error("Message cannot be empty");
    }

    if (trimmedBody.length > MAX_MESSAGE_LENGTH) {
      throw new Error(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`);
    }

    await ctx.db.patch(message._id, {
      body: trimmedBody,
      editedAt: Date.now(),
    });
  },
});

export const deleteMessage = mutation({
  args: {
    workspaceId: v.string(),
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const { identity, membership } = await requireMembership(ctx, args.workspaceId);
    const message = await getMessageById(ctx, args.messageId);

    if (!message || message.workspaceId !== args.workspaceId) {
      throw new Error("Message not found");
    }

    const canDelete =
      message.authorClerkId === identity.subject || membership.role === "host";

    if (!canDelete) {
      throw new Error("You do not have permission to delete this message");
    }

    if (!message.isDeleted) {
      await ctx.db.patch(message._id, {
        body: "",
        isDeleted: true,
        deletedAt: Date.now(),
        deletedByClerkId: identity.subject,
        editedAt: undefined,
      });
    }

    const reactions = await ctx.db
      .query("messageReactions")
      .withIndex("by_message", (query) => query.eq("messageId", message._id))
      .collect();

    await Promise.all(reactions.map((reaction) => ctx.db.delete(reaction._id)));

    return {
      deleted: true,
      attachment: message.attachment,
    };
  },
});

export const toggleReaction = mutation({
  args: {
    workspaceId: v.string(),
    messageId: v.id("messages"),
    emoji: v.union(
      v.literal("👍"),
      v.literal("❤️"),
      v.literal("😂"),
      v.literal("🎉"),
      v.literal("👀"),
    ),
  },
  handler: async (ctx, args) => {
    const { identity } = await requireMembership(ctx, args.workspaceId);
    const message = await getMessageById(ctx, args.messageId);

    if (!message || message.workspaceId !== args.workspaceId) {
      throw new Error("Message not found");
    }

    if (message.isDeleted) {
      throw new Error("Deleted messages cannot receive reactions");
    }

    const existingReaction = await ctx.db
      .query("messageReactions")
      .withIndex("by_message_user_emoji", (query) =>
        query
          .eq("messageId", message._id)
          .eq("userId", identity.subject)
          .eq("emoji", args.emoji),
      )
      .unique();

    if (existingReaction) {
      await ctx.db.delete(existingReaction._id);
      return { reacted: false };
    }

    await ctx.db.insert("messageReactions", {
      workspaceId: args.workspaceId,
      messageId: message._id,
      userId: identity.subject,
      emoji: args.emoji,
      createdAt: Date.now(),
    });

    return { reacted: true };
  },
});
