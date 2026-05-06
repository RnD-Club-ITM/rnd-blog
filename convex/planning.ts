import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireMembership } from "./lib/auth";

const planningPriority = v.union(
  v.literal("high"),
  v.literal("medium"),
  v.literal("low"),
);

export const board = query({
  args: {
    workspaceId: v.string(),
  },
  handler: async (ctx, args) => {
    const { identity } = await requireMembership(ctx, args.workspaceId);

    const columns = await ctx.db
      .query("planningColumns")
      .withIndex("by_workspace_position", (query) =>
        query.eq("workspaceId", args.workspaceId),
      )
      .collect();

    const allCompletions = await ctx.db
      .query("planningTaskCompletions")
      .withIndex("by_workspace", (query) =>
        query.eq("workspaceId", args.workspaceId),
      )
      .collect();

    const completionsByTask = new Map<string, typeof allCompletions>();
    for (const completion of allCompletions) {
      const existing = completionsByTask.get(completion.taskId) ?? [];
      existing.push(completion);
      completionsByTask.set(completion.taskId, existing);
    }

    const uniqueCompletedUsers = new Set(allCompletions.map((completion) => completion.userId));

    const columnsWithTasks = await Promise.all(
      columns.map(async (column) => {
        const tasks = await ctx.db
          .query("planningTasks")
          .withIndex("by_column_position", (query) =>
            query.eq("columnId", column._id),
          )
          .collect();

        const tasksWithCompletionState = tasks.map((task) => {
          const completions = completionsByTask.get(task._id) ?? [];
          return {
            ...task,
            completionCount: completions.length,
            completedByCurrentUser: completions.some(
              (completion) => completion.userId === identity.subject,
            ),
            completedByNames: completions.map((completion) => completion.userName),
          };
        });

        return {
          ...column,
          tasks: tasksWithCompletionState,
        };
      }),
    );

    return {
      columns: columnsWithTasks,
      completedMembersCount: uniqueCompletedUsers.size,
    };
  },
});

export const createColumn = mutation({
  args: {
    workspaceId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const { identity, membership } = await requireMembership(ctx, args.workspaceId);
    if (membership.role !== "host") {
      throw new Error("Only the workspace host can edit the planning board");
    }

    const title = args.title.trim();
    if (!title) {
      throw new Error("Column title cannot be empty");
    }

    const lastColumn = await ctx.db
      .query("planningColumns")
      .withIndex("by_workspace_position", (query) =>
        query.eq("workspaceId", args.workspaceId),
      )
      .order("desc")
      .first();

    return await ctx.db.insert("planningColumns", {
      workspaceId: args.workspaceId,
      title,
      position: (lastColumn?.position ?? -1) + 1,
      createdAt: Date.now(),
      createdBy: identity.subject,
    });
  },
});

export const renameColumn = mutation({
  args: {
    workspaceId: v.string(),
    columnId: v.id("planningColumns"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireMembership(ctx, args.workspaceId);
    if (membership.role !== "host") {
      throw new Error("Only the workspace host can edit the planning board");
    }

    const column = await ctx.db.get(args.columnId);
    if (!column || column.workspaceId !== args.workspaceId) {
      throw new Error("Planning column not found");
    }

    const title = args.title.trim();
    if (!title) {
      throw new Error("Column title cannot be empty");
    }

    await ctx.db.patch(args.columnId, { title });
  },
});

export const deleteColumn = mutation({
  args: {
    workspaceId: v.string(),
    columnId: v.id("planningColumns"),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireMembership(ctx, args.workspaceId);
    if (membership.role !== "host") {
      throw new Error("Only the workspace host can edit the planning board");
    }

    const column = await ctx.db.get(args.columnId);
    if (!column || column.workspaceId !== args.workspaceId) {
      throw new Error("Planning column not found");
    }

    const tasks = await ctx.db
      .query("planningTasks")
      .withIndex("by_column_position", (query) =>
        query.eq("columnId", args.columnId),
      )
      .collect();

    for (const task of tasks) {
      const completions = await ctx.db
        .query("planningTaskCompletions")
        .withIndex("by_task", (query) => query.eq("taskId", task._id))
        .collect();
      for (const completion of completions) {
        await ctx.db.delete(completion._id);
      }
      await ctx.db.delete(task._id);
    }

    await ctx.db.delete(args.columnId);

    const remainingColumns = await ctx.db
      .query("planningColumns")
      .withIndex("by_workspace_position", (query) =>
        query.eq("workspaceId", args.workspaceId),
      )
      .collect();

    await Promise.all(
      remainingColumns.map((remainingColumn, index) =>
        ctx.db.patch(remainingColumn._id, { position: index }),
      ),
    );
  },
});

export const createTask = mutation({
  args: {
    workspaceId: v.string(),
    columnId: v.id("planningColumns"),
    title: v.string(),
    priority: v.optional(planningPriority),
  },
  handler: async (ctx, args) => {
    const { identity, membership } = await requireMembership(ctx, args.workspaceId);
    if (membership.role !== "host") {
      throw new Error("Only the workspace host can edit the planning board");
    }

    const column = await ctx.db.get(args.columnId);
    if (!column || column.workspaceId !== args.workspaceId) {
      throw new Error("Planning column not found");
    }

    const title = args.title.trim();
    if (!title) {
      throw new Error("Task title cannot be empty");
    }

    const lastTask = await ctx.db
      .query("planningTasks")
      .withIndex("by_column_position", (query) =>
        query.eq("columnId", args.columnId),
      )
      .order("desc")
      .first();

    return await ctx.db.insert("planningTasks", {
      workspaceId: args.workspaceId,
      columnId: args.columnId,
      title,
      priority: args.priority ?? "medium",
      assigneeName: membership.name,
      completed: false,
      createdAt: Date.now(),
      createdBy: identity.subject,
      position: (lastTask?.position ?? -1) + 1,
    });
  },
});

export const deleteTask = mutation({
  args: {
    workspaceId: v.string(),
    taskId: v.id("planningTasks"),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireMembership(ctx, args.workspaceId);
    if (membership.role !== "host") {
      throw new Error("Only the workspace host can edit the planning board");
    }

    const task = await ctx.db.get(args.taskId);
    if (!task || task.workspaceId !== args.workspaceId) {
      throw new Error("Planning task not found");
    }

    const completions = await ctx.db
      .query("planningTaskCompletions")
      .withIndex("by_task", (query) => query.eq("taskId", args.taskId))
      .collect();

    for (const completion of completions) {
      await ctx.db.delete(completion._id);
    }

    const columnId = task.columnId;
    await ctx.db.delete(args.taskId);

    const remainingTasks = await ctx.db
      .query("planningTasks")
      .withIndex("by_column_position", (query) =>
        query.eq("columnId", columnId),
      )
      .collect();

    await Promise.all(
      remainingTasks.map((remainingTask, index) =>
        ctx.db.patch(remainingTask._id, { position: index }),
      ),
    );
  },
});

export const moveTask = mutation({
  args: {
    workspaceId: v.string(),
    taskId: v.id("planningTasks"),
    direction: v.union(v.literal("left"), v.literal("right")),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireMembership(ctx, args.workspaceId);
    if (membership.role !== "host") {
      throw new Error("Only the workspace host can edit the planning board");
    }

    const task = await ctx.db.get(args.taskId);
    if (!task || task.workspaceId !== args.workspaceId) {
      throw new Error("Planning task not found");
    }

    const columns = await ctx.db
      .query("planningColumns")
      .withIndex("by_workspace_position", (query) =>
        query.eq("workspaceId", args.workspaceId),
      )
      .collect();

    const currentIndex = columns.findIndex((column) => column._id === task.columnId);
    if (currentIndex === -1) {
      throw new Error("Planning column not found");
    }

    const nextIndex =
      args.direction === "left"
        ? Math.max(0, currentIndex - 1)
        : Math.min(columns.length - 1, currentIndex + 1);

    if (nextIndex === currentIndex) {
      return;
    }

    const targetColumn = columns[nextIndex];
    const lastTaskInTargetColumn = await ctx.db
      .query("planningTasks")
      .withIndex("by_column_position", (query) =>
        query.eq("columnId", targetColumn._id),
      )
      .order("desc")
      .first();

    await ctx.db.patch(args.taskId, {
      columnId: targetColumn._id,
      position: (lastTaskInTargetColumn?.position ?? -1) + 1,
    });

    const remainingTasks = await ctx.db
      .query("planningTasks")
      .withIndex("by_column_position", (query) =>
        query.eq("columnId", task.columnId),
      )
      .collect();

    await Promise.all(
      remainingTasks.map((remainingTask, index) =>
        ctx.db.patch(remainingTask._id, { position: index }),
      ),
    );
  },
});

export const toggleTaskCompletion = mutation({
  args: {
    workspaceId: v.string(),
    taskId: v.id("planningTasks"),
  },
  handler: async (ctx, args) => {
    const { identity, membership } = await requireMembership(ctx, args.workspaceId);

    const task = await ctx.db.get(args.taskId);
    if (!task || task.workspaceId !== args.workspaceId) {
      throw new Error("Planning task not found");
    }

    const existingCompletion = await ctx.db
      .query("planningTaskCompletions")
      .withIndex("by_workspace_user_task", (query) =>
        query
          .eq("workspaceId", args.workspaceId)
          .eq("userId", identity.subject)
          .eq("taskId", args.taskId),
      )
      .unique();

    if (existingCompletion) {
      await ctx.db.delete(existingCompletion._id);
      return;
    }

    await ctx.db.insert("planningTaskCompletions", {
      workspaceId: args.workspaceId,
      taskId: args.taskId,
      userId: identity.subject,
      userName: membership.name,
      completedAt: Date.now(),
    });
  },
});
