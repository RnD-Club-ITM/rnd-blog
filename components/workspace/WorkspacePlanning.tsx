"use client";

import React, { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaCircleCheck,
  FaPen,
  FaPlus,
  FaTrash,
  FaXmark,
} from "react-icons/fa6";

interface PlanningTask {
  _id: Id<"planningTasks">;
  title: string;
  priority: "high" | "medium" | "low";
  assigneeName?: string;
  completionCount: number;
  completedByCurrentUser: boolean;
  completedByNames: string[];
}

interface PlanningColumn {
  _id: Id<"planningColumns">;
  title: string;
  position: number;
  tasks: PlanningTask[];
}

interface PlanningBoard {
  columns: PlanningColumn[];
  completedMembersCount: number;
}

interface WorkspacePlanningProps {
  workspaceId: string;
  planningReady: boolean;
  planningPreparing?: boolean;
  planningUnavailableReason?: string;
  canEdit: boolean;
  memberCount: number;
}

function getInitials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getPriorityClasses(priority: PlanningTask["priority"]) {
  if (priority === "high") return "bg-orange-100 text-orange-700";
  if (priority === "medium") return "bg-blue-100 text-blue-700";
  return "bg-zinc-100 text-zinc-600";
}

function SetupNotice({
  title,
  reason,
}: {
  title: string;
  reason?: string;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <div className="border-b border-[#E5E0D8] bg-white px-6 py-5">
        <div className="flex items-center gap-3 text-sm font-semibold text-[#111]">
          <span className="font-mono text-sm text-[#8A8174]">▦</span>
          planning
        </div>
        <p className="mt-1 text-sm text-[#7A7267]">
          Sprint board for the collaboration. Hosts can create their own columns and tasks here.
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center bg-[#FCFBF8] px-6 text-center">
        <div className="max-w-md rounded-2xl border border-[#E5E0D8] bg-white p-6">
          <p className="text-sm font-semibold text-[#181512]">{title}</p>
          <p className="mt-2 text-sm leading-6 text-[#7A7267]">{reason}</p>
        </div>
      </div>
    </div>
  );
}

function ColumnEditor({
  title,
  onSave,
  onCancel,
}: {
  title: string;
  onSave: (title: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(title);

  return (
    <div className="flex items-center gap-2">
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") onSave(value);
          if (event.key === "Escape") onCancel();
        }}
        autoFocus
        className="min-w-0 flex-1 rounded-md border border-[#DED7CC] bg-[#FCFBF8] px-2 py-1 text-sm text-[#1B1814] outline-none focus:border-[#FF5C00]"
      />
      <button
        onClick={() => onSave(value)}
        className="rounded-md border border-[#E5E0D8] p-1.5 text-[#7A7267] transition hover:border-[#FF5C00] hover:text-[#FF5C00]"
        aria-label="Save column title"
      >
        <FaCheck className="text-[10px]" />
      </button>
      <button
        onClick={onCancel}
        className="rounded-md border border-[#E5E0D8] p-1.5 text-[#7A7267] transition hover:border-[#FF5C00] hover:text-[#FF5C00]"
        aria-label="Cancel column edit"
      >
        <FaXmark className="text-[10px]" />
      </button>
    </div>
  );
}

export function WorkspacePlanning({
  workspaceId,
  planningReady,
  planningPreparing,
  planningUnavailableReason,
  canEdit,
  memberCount,
}: WorkspacePlanningProps) {
  const board = useQuery(
    api.planning.board,
    planningReady ? { workspaceId } : "skip",
  ) as PlanningBoard | undefined;
  const createColumn = useMutation(api.planning.createColumn);
  const renameColumn = useMutation(api.planning.renameColumn);
  const deleteColumn = useMutation(api.planning.deleteColumn);
  const createTask = useMutation(api.planning.createTask);
  const deleteTask = useMutation(api.planning.deleteTask);
  const moveTask = useMutation(api.planning.moveTask);
  const toggleTaskCompletion = useMutation(api.planning.toggleTaskCompletion);

  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [columnTaskDrafts, setColumnTaskDrafts] = useState<Record<string, string>>({});
  const [editingColumnId, setEditingColumnId] = useState<Id<"planningColumns"> | null>(null);

  const columns = useMemo(() => board?.columns || [], [board]);
  const totalTasks = useMemo(
    () => columns.reduce((sum, column) => sum + column.tasks.length, 0),
    [columns],
  );
  const completedTasks = useMemo(
    () =>
      columns.reduce(
        (sum, column) =>
          sum + column.tasks.filter((task) => task.completionCount > 0).length,
        0,
      ),
    [columns],
  );
  const activeTasks = Math.max(totalTasks - completedTasks, 0);
  const completedMembersCount = board?.completedMembersCount ?? 0;

  if (!planningReady) {
    return (
      <SetupNotice
        title={
          planningPreparing
            ? "Preparing shared planning board..."
            : "Shared planning board is unavailable right now."
        }
        reason={
          planningPreparing
            ? "Syncing workspace access before loading the board."
            : planningUnavailableReason ||
              "Convex must be available for the shared planning board to work."
        }
      />
    );
  }

  const handleCreateColumn = async () => {
    const title = newColumnTitle.trim();
    if (!title) return;
    try {
      await createColumn({ workspaceId, title });
      setNewColumnTitle("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create board");
    }
  };

  const handleRenameColumn = async (columnId: string, title: string) => {
    try {
      await renameColumn({ workspaceId, columnId: columnId as Id<"planningColumns">, title });
      setEditingColumnId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to rename board");
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    try {
      await deleteColumn({ workspaceId, columnId: columnId as Id<"planningColumns"> });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete board");
    }
  };

  const handleCreateTask = async (columnId: string) => {
    const title = columnTaskDrafts[columnId]?.trim();
    if (!title) return;
    try {
      await createTask({ workspaceId, columnId: columnId as Id<"planningColumns">, title });
      setColumnTaskDrafts((current) => ({ ...current, [columnId]: "" }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask({ workspaceId, taskId: taskId as Id<"planningTasks"> });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete task");
    }
  };

  const handleMoveTask = async (taskId: string, direction: "left" | "right") => {
    try {
      await moveTask({ workspaceId, taskId: taskId as Id<"planningTasks">, direction });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to move task");
    }
  };

  const handleToggleTaskCompletion = async (taskId: string) => {
    try {
      await toggleTaskCompletion({
        workspaceId,
        taskId: taskId as Id<"planningTasks">,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update task completion",
      );
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#FCFBF8]">
      <div className="border-b border-[#E5E0D8] bg-white px-6 py-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3 text-sm font-semibold text-[#111]">
              <span className="font-mono text-sm text-[#8A8174]">▦</span>
              planning
            </div>
            <p className="mt-1 text-sm text-[#7A7267]">
              Hosts can create custom boards, then add tasks directly inside each board.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-[#F3EFE7] px-3 py-1 font-medium text-[#5D564B]">
                {memberCount} joined
              </span>
              <span className="rounded-full bg-[#E9F7EE] px-3 py-1 font-medium text-[#1D7A46]">
                {completedMembersCount} members done work
              </span>
              <span className="rounded-full bg-[#FFF1E8] px-3 py-1 font-medium text-[#D94E00]">
                {completedTasks} tasks touched
              </span>
              <span className="rounded-full bg-[#EEF3FF] px-3 py-1 font-medium text-[#3554C5]">
                {activeTasks} untouched
              </span>
            </div>
          </div>
          {canEdit ? (
            <div className="flex gap-2">
              <input
                value={newColumnTitle}
                onChange={(event) => setNewColumnTitle(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && handleCreateColumn()}
                placeholder="Create a new board"
                className="w-full rounded-lg border border-[#DED7CC] bg-[#FCFBF8] px-3 py-2 text-sm text-[#1B1814] outline-none placeholder:text-[#9B9287] focus:border-[#FF5C00] lg:w-64"
              />
              <button
                onClick={handleCreateColumn}
                className="inline-flex items-center gap-2 rounded-lg bg-[#FF5C00] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#E65400]"
              >
                <FaPlus className="text-xs" />
                Board
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-6">
        {columns.length ? (
          <div className="flex min-w-max gap-4">
            {columns.map((column, index) => (
              <div
                key={column._id}
                className="flex w-[300px] flex-col rounded-2xl border border-[#E5E0D8] bg-white"
              >
                <div className="space-y-3 border-b border-[#EFE9DE] px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {editingColumnId === column._id && canEdit ? (
                        <ColumnEditor
                          title={column.title}
                          onSave={(title) => handleRenameColumn(column._id, title)}
                          onCancel={() => setEditingColumnId(null)}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-[#1B1814]">
                            {column.title}
                          </h3>
                          {canEdit ? (
                            <button
                              onClick={() => setEditingColumnId(column._id)}
                              className="rounded-md border border-[#E5E0D8] p-1.5 text-[#7A7267] transition hover:border-[#FF5C00] hover:text-[#FF5C00]"
                              aria-label="Rename board"
                            >
                              <FaPen className="text-[10px]" />
                            </button>
                          ) : null}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#F3EFE7] px-2.5 py-0.5 font-mono text-xs text-[#6E665A]">
                        {column.tasks.length}
                      </span>
                      {canEdit ? (
                        <button
                          onClick={() => handleDeleteColumn(column._id)}
                          className="rounded-md border border-[#E5E0D8] p-1.5 text-[#7A7267] transition hover:border-[#FF5C00] hover:text-[#FF5C00]"
                          aria-label="Delete board"
                        >
                          <FaTrash className="text-[10px]" />
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {canEdit ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={columnTaskDrafts[column._id] || ""}
                        onChange={(event) =>
                          setColumnTaskDrafts((current) => ({
                            ...current,
                            [column._id]: event.target.value,
                          }))
                        }
                        onKeyDown={(event) =>
                          event.key === "Enter" && handleCreateTask(column._id)
                        }
                        placeholder={`Add task in ${column.title}`}
                        className="min-w-0 flex-1 rounded-lg border border-[#DED7CC] bg-[#FCFBF8] px-3 py-2 text-sm text-[#1B1814] outline-none placeholder:text-[#9B9287] focus:border-[#FF5C00]"
                      />
                      <button
                        onClick={() => handleCreateTask(column._id)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF5C00] text-white transition hover:bg-[#E65400]"
                        aria-label={`Add task to ${column.title}`}
                      >
                        <FaPlus className="text-xs" />
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  {column.tasks.map((task) => (
                    <div
                      key={task._id}
                      className={`flex min-h-[196px] flex-col rounded-xl border p-4 shadow-[0_10px_24px_rgba(17,17,17,0.04)] ${
                        task.completedByCurrentUser
                          ? "border-[#D6EBDC] bg-[#F7FCF8]"
                          : "border-[#ECE5DB] bg-[#FFFEFC]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleTaskCompletion(task._id)}
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-full border transition ${
                              task.completedByCurrentUser
                                ? "border-[#1D7A46] bg-[#1D7A46] text-white"
                                : "border-[#D9D2C7] bg-white text-[#8A8174] hover:border-[#1D7A46] hover:text-[#1D7A46]"
                            }`}
                            aria-label={
                              task.completedByCurrentUser
                                ? "Mark task as incomplete"
                                : "Mark task as completed"
                            }
                          >
                            <FaCircleCheck className="text-[12px]" />
                          </button>
                          <span
                            className={`rounded-md px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${
                              task.completedByCurrentUser
                                ? "bg-[#E9F7EE] text-[#1D7A46]"
                                : "bg-stone-100 text-stone-700"
                            }`}
                          >
                            {task.completedByCurrentUser ? "Done by you" : "Task"}
                          </span>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${getPriorityClasses(task.priority)}`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <div className="mt-3">
                        <p
                          className={`text-sm font-medium leading-6 whitespace-pre-wrap break-words ${
                          task.completedByCurrentUser
                            ? "text-[#61715F] line-through"
                            : "text-[#28231C]"
                        }`}
                        >
                          {task.title}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-[#7A7267]">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-700 text-[10px] font-semibold text-white">
                            {getInitials(task.assigneeName)}
                          </div>
                          <div className="flex flex-col">
                            <span>{task.assigneeName || "Unassigned"}</span>
                            {task.completionCount > 0 ? (
                              <span className="text-[10px] text-[#1D7A46]">
                                {task.completionCount} member(s) completed
                              </span>
                            ) : null}
                          </div>
                        </div>
                        {canEdit && task.completedByNames.length ? (
                          <div className="max-w-[120px] truncate text-right text-[10px] text-[#1D7A46]">
                            {task.completedByNames.join(", ")}
                          </div>
                        ) : null}
                        {canEdit ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteTask(task._id)}
                              className="rounded-md border border-[#E5E0D8] p-1.5 text-[#7A7267] transition hover:border-[#FF5C00] hover:text-[#FF5C00]"
                              aria-label="Delete task"
                            >
                              <FaTrash className="text-[10px]" />
                            </button>
                            <button
                              onClick={() => handleMoveTask(task._id, "left")}
                              disabled={index === 0}
                              className="rounded-md border border-[#E5E0D8] p-1.5 text-[#7A7267] transition hover:border-[#FF5C00] hover:text-[#FF5C00] disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label="Move task left"
                            >
                              <FaArrowLeft className="text-[10px]" />
                            </button>
                            <button
                              onClick={() => handleMoveTask(task._id, "right")}
                              disabled={index === columns.length - 1}
                              className="rounded-md border border-[#E5E0D8] p-1.5 text-[#7A7267] transition hover:border-[#FF5C00] hover:text-[#FF5C00] disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label="Move task right"
                            >
                              <FaArrowRight className="text-[10px]" />
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}

                  {!column.tasks.length ? (
                    <div className="flex min-h-32 items-center justify-center rounded-xl border border-dashed border-[#E5E0D8] bg-[#FCFBF8] p-4 text-center text-sm text-[#948B80]">
                      No tasks here yet.
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#E5E0D8] bg-white p-8 text-center">
            <p className="text-sm font-semibold text-[#181512]">
              No boards created yet.
            </p>
            <p className="mt-2 text-sm leading-6 text-[#7A7267]">
              {canEdit
                ? "Create the first board for this workspace, then add tasks directly inside it."
                : "The host has not created any planning boards yet."}
            </p>
          </div>
        )}

        {columns.length ? (
          <div className="mt-6 rounded-2xl border border-[#E5E0D8] bg-white p-4 text-sm text-[#7A7267]">
            {totalTasks} task(s) across {columns.length} board(s).
          </div>
        ) : null}
      </div>
    </div>
  );
}
