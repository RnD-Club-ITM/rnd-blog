import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const channelKind = v.union(v.literal("announcements"), v.literal("standard"));
const workspaceRole = v.union(v.literal("host"), v.literal("member"));
const chatAttachment = v.object({
  publicId: v.string(),
  url: v.string(),
  previewUrl: v.optional(v.string()),
  fileName: v.string(),
  fileType: v.string(),
  fileSize: v.number(),
  resourceType: v.string(),
});

export default defineSchema({
  siteVisitors: defineTable({
    visitorId: v.string(),
    firstSeenAt: v.number(),
    lastSeenAt: v.number(),
  }).index("by_visitor_id", ["visitorId"]),

  channels: defineTable({
    workspaceId: v.string(),
    slug: v.string(),
    name: v.string(),
    kind: channelKind,
    position: v.number(),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_position", ["workspaceId", "position"])
    .index("by_workspace_slug", ["workspaceId", "slug"]),

  memberships: defineTable({
    workspaceId: v.string(),
    userId: v.string(),
    role: workspaceRole,
    active: v.boolean(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    syncedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_user", ["workspaceId", "userId"])
    .index("by_user", ["userId"]),

  messageReads: defineTable({
    workspaceId: v.string(),
    channelSlug: v.string(),
    userId: v.string(),
    lastReadAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace_user_channel", [
      "workspaceId",
      "userId",
      "channelSlug",
    ])
    .index("by_workspace_user", ["workspaceId", "userId"]),

  messages: defineTable({
    workspaceId: v.string(),
    channelId: v.id("channels"),
    channelSlug: v.string(),
    body: v.string(),
    authorClerkId: v.string(),
    authorName: v.string(),
    authorAvatarUrl: v.optional(v.string()),
    clientMessageId: v.string(),
    createdAt: v.number(),
    isDeleted: v.optional(v.boolean()),
    deletedAt: v.optional(v.number()),
    deletedByClerkId: v.optional(v.string()),
    editedAt: v.optional(v.number()),
    attachment: v.optional(chatAttachment),
  })
    .index("by_channel_created", ["channelId", "createdAt", "clientMessageId"])
    .index("by_channel_author_client", [
      "channelId",
      "authorClerkId",
      "clientMessageId",
    ]),

  messageReactions: defineTable({
    workspaceId: v.string(),
    messageId: v.id("messages"),
    userId: v.string(),
    emoji: v.string(),
    createdAt: v.number(),
  })
    .index("by_message", ["messageId"])
    .index("by_message_user_emoji", ["messageId", "userId", "emoji"]),

  planningColumns: defineTable({
    workspaceId: v.string(),
    title: v.string(),
    position: v.number(),
    createdAt: v.number(),
    createdBy: v.string(),
  })
    .index("by_workspace_position", ["workspaceId", "position"])
    .index("by_workspace", ["workspaceId"]),

  planningTasks: defineTable({
    workspaceId: v.string(),
    columnId: v.id("planningColumns"),
    title: v.string(),
    priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    assigneeName: v.optional(v.string()),
    completed: v.optional(v.boolean()),
    completedAt: v.optional(v.number()),
    completedByName: v.optional(v.string()),
    createdAt: v.number(),
    createdBy: v.string(),
    position: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_column_position", ["columnId", "position"])
    .index("by_workspace_column", ["workspaceId", "columnId"]),

  planningTaskCompletions: defineTable({
    workspaceId: v.string(),
    taskId: v.id("planningTasks"),
    userId: v.string(),
    userName: v.string(),
    completedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_task", ["taskId"])
    .index("by_workspace_user_task", ["workspaceId", "userId", "taskId"])
    .index("by_workspace_user", ["workspaceId", "userId"]),
});
