"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { format, isToday, isYesterday } from "date-fns";
import { toast } from "sonner";
import { generateClientId } from "@/lib/utils/generateClientId";
import {
  FaComments,
  FaFaceSmile,
  FaHashtag,
  FaImage,
  FaLock,
  FaPaperclip,
  FaPaperPlane,
  FaPen,
  FaTrash,
  FaTriangleExclamation,
  FaXmark,
} from "react-icons/fa6";

const ALLOWED_REACTIONS = ["👍", "❤️", "😂", "🎉", "👀"] as const;
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;
const SUPPORTED_ATTACHMENT_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

interface WorkspaceChatProps {
  workspaceId: string;
  channelSlug: "announcements" | "team-chat" | "updates";
  title: string;
  description: string;
  convexConfigured: boolean;
  chatReady: boolean;
  chatPreparing?: boolean;
  chatUnavailableReason?: string;
  currentUserRole: "host" | "member";
  memberName: string;
  memberAvatarUrl?: string;
  canPost?: boolean;
  pinnedContent?: React.ReactNode;
}

interface ChatReaction {
  emoji: string;
  count: number;
  reactedByMe: boolean;
}

interface ChatAttachment {
  publicId: string;
  url: string;
  previewUrl?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  resourceType: string;
}

interface ChatMessage {
  _id: string;
  body: string;
  authorName: string;
  authorAvatarUrl?: string;
  authorClerkId: string;
  createdAt: number;
  isDeleted?: boolean;
  editedAt?: number;
  attachment?: ChatAttachment;
  reactions?: ChatReaction[];
}

interface ChannelUnreadState {
  channelSlug: string;
  lastReadAt: number;
  latestMessageAt?: number;
  unreadCount: number;
}

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  original_filename?: string;
  bytes?: number;
  resource_type?: string;
  format?: string;
}

function formatMessageTime(timestamp: number) {
  try {
    return format(new Date(timestamp), "HH:mm");
  } catch {
    return "";
  }
}

function formatDateSeparator(timestamp: number) {
  try {
    const date = new Date(timestamp);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d, yyyy");
  } catch {
    return "";
  }
}

function getInitials(name: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatFileSize(size: number) {
  if (!size) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageAttachment(attachment?: ChatAttachment) {
  return Boolean(
    attachment &&
      (attachment.fileType.startsWith("image/") ||
        attachment.resourceType === "image"),
  );
}

function normalizeUploadFileName(file: File, result: CloudinaryUploadResult) {
  if (file.name) return file.name;
  if (result.original_filename && result.format) {
    return `${result.original_filename}.${result.format}`;
  }
  return result.original_filename || "attachment";
}

function SetupNotice({ reason }: { reason?: string }) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-[#111111]">
      <div className="border-b border-[#E5E0D8] bg-white px-5 py-4 dark:border-[#2A2A2A] dark:bg-[#111111]">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#111111] dark:text-[#F6F2EA]">
          <FaTriangleExclamation className="text-[#FF5C00]" />
          Chat setup required
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center bg-[#FCFBF8] px-6 text-center dark:bg-[#0D0D0D]">
        <div className="max-w-md rounded-2xl border border-[#E5E0D8] bg-white p-6 dark:border-[#2A2A2A] dark:bg-[#161616]">
          <p className="text-sm font-semibold text-[#181512] dark:text-[#F6F2EA]">
            Realtime workspace chat is unavailable right now.
          </p>
          <p className="mt-2 text-sm leading-6 text-[#7A7267] dark:text-[#A8A093]">
            {reason ||
              "Add `NEXT_PUBLIC_CONVEX_URL`, configure the Clerk Convex JWT issuer, and run `npx convex dev` to enable realtime workspace chat."}
          </p>
        </div>
      </div>
    </div>
  );
}

function AttachmentCard({
  attachment,
  compact = false,
}: {
  attachment: ChatAttachment;
  compact?: boolean;
}) {
  if (isImageAttachment(attachment)) {
    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noreferrer"
        className={`mt-2 block overflow-hidden rounded-xl border border-[#E7E0D6] bg-white dark:border-[#2E2E2E] dark:bg-[#171717] ${
          compact ? "max-w-[220px]" : "max-w-[320px]"
        }`}
      >
        <Image
          src={attachment.previewUrl || attachment.url}
          alt={attachment.fileName}
          width={640}
          height={420}
          unoptimized
          className="max-h-56 w-full object-cover"
        />
        <div className="border-t border-[#E7E0D6] px-3 py-2 text-xs text-[#5E564B] dark:border-[#2E2E2E] dark:text-[#A8A093]">
          <div className="font-medium text-[#28231C] dark:text-[#F6F2EA]">{attachment.fileName}</div>
          <div>{formatFileSize(attachment.fileSize)}</div>
        </div>
      </a>
    );
  }

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noreferrer"
      className="mt-2 flex max-w-[320px] items-center gap-3 rounded-xl border border-[#E7E0D6] bg-white px-3 py-3 text-left transition hover:border-[#FF5C00] dark:border-[#2E2E2E] dark:bg-[#171717]"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF4EE] text-[#FF5C00] dark:bg-[#2A1B14]">
        <FaPaperclip className="text-sm" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-[#28231C] dark:text-[#F6F2EA]">
          {attachment.fileName}
        </div>
        <div className="text-xs text-[#7A7267] dark:text-[#A8A093]">
          {attachment.fileType || "File"} · {formatFileSize(attachment.fileSize)}
        </div>
      </div>
    </a>
  );
}

function SyncedRealtimeWorkspaceChat({
  workspaceId,
  channelSlug,
  title,
  description,
  currentUserRole,
  canPost = true,
  pinnedContent,
}: Pick<
  WorkspaceChatProps,
  | "workspaceId"
  | "channelSlug"
  | "title"
  | "description"
  | "currentUserRole"
  | "canPost"
  | "pinnedContent"
>) {
  const { user } = useUser();
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingReactionKey, setPendingReactionKey] = useState<string | null>(null);
  const [reactionPickerMessageId, setReactionPickerMessageId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastChannelRef = useRef(channelSlug);

  const sendMessage = useMutation(api.messages.send);
  const markRead = useMutation(api.messages.markRead);
  const editMessage = useMutation(api.messages.editMessage);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const toggleReaction = useMutation(api.messages.toggleReaction);
  const createAttachmentMessage = useMutation(api.messages.createAttachmentMessage);
  const unreadSummary = useQuery(api.messages.unreadSummary, {
    workspaceId,
  }) as ChannelUnreadState[] | undefined;
  const { results, status, loadMore } = usePaginatedQuery(
    api.messages.list,
    {
      workspaceId,
      channelSlug,
    },
    { initialNumItems: 30 },
  );

  const messages = useMemo(() => {
    return [...(results || [])].reverse() as ChatMessage[];
  }, [results]);

  const channelUnreadState = unreadSummary?.find(
    (entry) => entry.channelSlug === channelSlug,
  );

  const latestMessageId = messages[messages.length - 1]?._id;
  const latestMessageAt = messages[messages.length - 1]?.createdAt;
  const lastMarkedReadRef = useRef(0);

  useEffect(() => {
    if (!scrollRef.current) return;

    const channelChanged = lastChannelRef.current !== channelSlug;
    if (channelChanged) {
      lastChannelRef.current = channelSlug;
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      return;
    }

    if (latestMessageId) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [channelSlug, latestMessageId]);

  useEffect(() => {
    if (!latestMessageAt || !channelUnreadState) return;

    const readAt = Math.max(channelUnreadState.lastReadAt, latestMessageAt);
    if (readAt <= lastMarkedReadRef.current) return;

    lastMarkedReadRef.current = readAt;

    void markRead({
      workspaceId,
      channelSlug,
      readAt,
    }).catch((error) => {
      console.error(error);
      lastMarkedReadRef.current = 0;
    });
  }, [
    channelSlug,
    channelUnreadState,
    latestMessageAt,
    markRead,
    workspaceId,
  ]);

  const clearComposer = () => {
    setNewMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSend = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed || !canPost || !user) return;

    setIsSending(true);

    try {
      await sendMessage({
        workspaceId,
        channelSlug,
        body: trimmed,
        clientMessageId: generateClientId(),
      });
      setNewMessage("");
      inputRef.current?.focus();
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Failed to send message";
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleStartEditing = (message: ChatMessage) => {
    setEditingMessageId(message._id);
    setEditingBody(message.body);
  };

  const handleSaveEdit = async () => {
    if (!editingMessageId) return;

    try {
      await editMessage({
        workspaceId,
        messageId: editingMessageId as never,
        body: editingBody,
      });
      setEditingMessageId(null);
      setEditingBody("");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update message",
      );
    }
  };

  const handleDelete = async (message: ChatMessage) => {
    if (!window.confirm("Delete this message?")) return;

    setPendingDeleteId(message._id);

    try {
      const result = (await deleteMessage({
        workspaceId,
        messageId: message._id as never,
      })) as { attachment?: ChatAttachment };

      if (result?.attachment?.publicId) {
        const response = await fetch("/api/upload", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            publicId: result.attachment.publicId,
            resourceType: result.attachment.resourceType,
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error || "Attachment cleanup failed");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete message",
      );
    } finally {
      setPendingDeleteId(null);
    }
  };

  const handleToggleReaction = async (messageId: string, emoji: string) => {
    const reactionKey = `${messageId}:${emoji}`;
    setPendingReactionKey(reactionKey);
    try {
      await toggleReaction({
        workspaceId,
        messageId: messageId as never,
        emoji: emoji as (typeof ALLOWED_REACTIONS)[number],
      });
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update reaction",
      );
    } finally {
      setPendingReactionKey(null);
    }
  };

  const handleAttachmentSelected = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user || !canPost) return;

    if (!SUPPORTED_ATTACHMENT_TYPES.has(file.type)) {
      toast.error("Unsupported file type for chat attachments");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_ATTACHMENT_SIZE) {
      toast.error("Attachments must be 10 MB or smaller");
      event.target.value = "";
      return;
    }

    setIsUploading(true);

    try {
      const uploadResponse = await fetch(
        "/api/upload?folder=rnd-blog/collaboration-chat",
        {
          method: "POST",
          body: file,
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
        },
      );

      if (!uploadResponse.ok) {
        const payload = await uploadResponse.json().catch(() => null);
        throw new Error(payload?.error || "Failed to upload attachment");
      }

      const uploadResult =
        (await uploadResponse.json()) as CloudinaryUploadResult;

      await createAttachmentMessage({
        workspaceId,
        channelSlug,
        body: newMessage.trim(),
        clientMessageId: generateClientId(),
        attachment: {
          publicId: uploadResult.public_id,
          url: uploadResult.secure_url,
          previewUrl: file.type.startsWith("image/")
            ? uploadResult.secure_url
            : undefined,
          fileName: normalizeUploadFileName(file, uploadResult),
          fileType: file.type || "application/octet-stream",
          fileSize: file.size,
          resourceType: uploadResult.resource_type || "raw",
        },
      });

      clearComposer();
      inputRef.current?.focus();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send attachment",
      );
    } finally {
      setIsUploading(false);
    }
  };

  let lastDate = "";
  let unreadSeparatorShown = false;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-[#111111]">
      <div className="flex flex-shrink-0 items-center justify-between border-b border-[#E5E0D8] bg-white px-5 py-4 dark:border-[#2A2A2A] dark:bg-[#111111]">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF5C00] text-white">
              <FaHashtag className="text-xs" />
            </div>
            <h3 className="text-sm font-semibold text-[#111111] dark:text-[#F6F2EA]">{title}</h3>
          </div>
          <p className="mt-1 text-xs text-[#7A7267] dark:text-[#A8A093]">{description}</p>
        </div>
        <span className="rounded-full bg-[#F3EFE7] px-2 py-0.5 font-mono text-[10px] text-[#7A7267] dark:bg-[#2B2B2B] dark:text-[#C8C2B7]">
          {messages.length} msgs
        </span>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#FCFBF8] px-5 py-4 dark:bg-[#0D0D0D]" ref={scrollRef}>
        {status === "CanLoadMore" || status === "LoadingMore" ? (
          <div className="mb-4 flex justify-center">
            <button
              onClick={() => loadMore(20)}
              disabled={status === "LoadingMore"}
              className="rounded-full border border-[#E5E0D8] bg-white px-3 py-1 text-xs font-medium text-[#5E564B] transition hover:border-[#FF5C00] hover:text-[#FF5C00] disabled:opacity-60 dark:border-[#3A342C] dark:bg-[#171717] dark:text-[#C8C2B7]"
            >
              {status === "LoadingMore" ? "Loading history..." : "Load older messages"}
            </button>
          </div>
        ) : null}

        {pinnedContent ? <div className="mb-4">{pinnedContent}</div> : null}

        {messages.length > 0 ? (
          <div className="space-y-1">
            {messages.map((message) => {
              const isMe = Boolean(user?.id && message.authorClerkId === user.id);
              const isDeleted = Boolean(message.isDeleted);
              const canEdit = isMe && !isDeleted;
              const canDelete = !isDeleted && (isMe || currentUserRole === "host");
              const separator = formatDateSeparator(message.createdAt);
              const shouldShowSeparator = separator && separator !== lastDate;
              const shouldShowUnreadSeparator = Boolean(
                !unreadSeparatorShown &&
                  channelUnreadState?.lastReadAt &&
                  message.createdAt > channelUnreadState.lastReadAt &&
                  !isMe,
              );

              if (shouldShowSeparator) {
                lastDate = separator;
              }
              if (shouldShowUnreadSeparator) {
                unreadSeparatorShown = true;
              }

              const reactionMap = new Map(
                (message.reactions || []).map((reaction) => [reaction.emoji, reaction]),
              );
              const activeReactions = (message.reactions || []).filter(
                (reaction) => reaction.count > 0,
              );
              const showReactionPicker = reactionPickerMessageId === message._id;

              return (
                <React.Fragment key={message._id}>
                  {shouldShowSeparator ? (
                    <div className="my-3 flex items-center gap-3">
                      <div className="h-px flex-1 bg-[#E7E0D6] dark:bg-[#2E2E2E]" />
                      <span className="rounded-full border border-[#E7E0D6] bg-white px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#8A8174] dark:border-[#2E2E2E] dark:bg-[#161616] dark:text-[#8F887B]">
                        {separator}
                      </span>
                      <div className="h-px flex-1 bg-[#E7E0D6] dark:bg-[#2E2E2E]" />
                    </div>
                  ) : null}

                  {shouldShowUnreadSeparator ? (
                    <div className="my-3 flex items-center gap-3">
                      <div className="h-px flex-1 bg-[#FFD7C2] dark:bg-[#4B2D20]" />
                      <span className="rounded-full border border-[#FFD7C2] bg-[#FFF4EE] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#D94E00] dark:border-[#4B2D20] dark:bg-[#2A1B14] dark:text-[#FFAA73]">
                        New
                      </span>
                      <div className="h-px flex-1 bg-[#FFD7C2] dark:bg-[#4B2D20]" />
                    </div>
                  ) : null}

                  <div className={`group mt-2 flex ${isMe ? "justify-end" : "justify-start"}`}>
                    {!isMe ? (
                      <div className="mr-2 mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1A2947] to-[#2D4570] text-[10px] font-bold text-white">
                        {getInitials(message.authorName)}
                      </div>
                    ) : null}

                    <div className={`max-w-[78%] ${isMe ? "ml-auto" : ""}`}>
                      {!isMe ? (
                        <div className="mb-0.5 ml-1 text-[11px] font-semibold text-[#28231C] dark:text-[#F6F2EA]">
                          {message.authorName}
                        </div>
                      ) : null}

                      <div className="relative">
                        {(canEdit || canDelete || !isDeleted) && editingMessageId !== message._id ? (
                          <div
                            className={`absolute -top-3 z-20 flex gap-1 opacity-0 transition group-hover:opacity-100 ${
                              isMe ? "left-0" : "right-0"
                            }`}
                          >
                            {!isDeleted ? (
                              <div className="relative">
                                <button
                                  onClick={() =>
                                    setReactionPickerMessageId((current) =>
                                      current === message._id ? null : message._id,
                                    )
                                  }
                                  className="rounded-full border border-[#E7E0D6] bg-white px-2 py-1 text-[11px] text-[#5E564B] transition hover:border-[#FF5C00] hover:text-[#FF5C00] dark:border-[#3A342C] dark:bg-[#171717] dark:text-[#C8C2B7]"
                                  title="React to message"
                                >
                                  <FaFaceSmile />
                                </button>

                                {showReactionPicker ? (
                                  <div
                                    className={`absolute top-9 z-30 flex gap-1 rounded-full border border-[#E7E0D6] bg-white px-2 py-1 shadow-[0_8px_30px_rgba(24,21,18,0.08)] dark:border-[#3A342C] dark:bg-[#171717] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] ${
                                      isMe ? "left-0" : "right-0"
                                    }`}
                                  >
                                    {ALLOWED_REACTIONS.map((emoji) => {
                                      const reaction = reactionMap.get(emoji);
                                      const reactionKey = `${message._id}:${emoji}`;
                                      return (
                                        <button
                                          key={emoji}
                                          onClick={() => {
                                            void handleToggleReaction(message._id, emoji);
                                            setReactionPickerMessageId(null);
                                          }}
                                          disabled={pendingReactionKey === reactionKey}
                                          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition ${
                                            reaction?.reactedByMe
                                              ? "bg-[#FFF1E8] dark:bg-[#2A1B14]"
                                              : "hover:bg-[#FFF7F2] dark:hover:bg-[#232323]"
                                          } disabled:opacity-50`}
                                        >
                                          {emoji}
                                        </button>
                                      );
                                    })}
                                  </div>
                                ) : null}
                              </div>
                            ) : null}

                            {canEdit ? (
                              <button
                                onClick={() => handleStartEditing(message)}
                                className="rounded-full border border-[#E7E0D6] bg-white px-2 py-1 text-[11px] text-[#5E564B] transition hover:border-[#FF5C00] hover:text-[#FF5C00] dark:border-[#3A342C] dark:bg-[#171717] dark:text-[#C8C2B7]"
                                title="Edit message"
                              >
                                <FaPen />
                              </button>
                            ) : null}
                            {canDelete ? (
                              <button
                                onClick={() => void handleDelete(message)}
                                disabled={pendingDeleteId === message._id}
                                className="rounded-full border border-[#E7E0D6] bg-white px-2 py-1 text-[11px] text-[#5E564B] transition hover:border-[#C23B00] hover:text-[#C23B00] disabled:opacity-50 dark:border-[#3A342C] dark:bg-[#171717] dark:text-[#C8C2B7]"
                                title="Delete message"
                              >
                                <FaTrash />
                              </button>
                            ) : null}
                          </div>
                        ) : null}

                        <div
                          className={`rounded-xl px-3 py-2 ${
                            isDeleted
                              ? "border border-dashed border-[#E7E0D6] bg-[#F7F5F0] text-[#8A8174] dark:border-[#3A342C] dark:bg-[#171717] dark:text-[#8F887B]"
                              : isMe
                                ? "rounded-br-sm bg-[#FF5C00] text-white"
                                : "rounded-bl-sm border border-[#E7E0D6] bg-white text-[#28231C] dark:border-[#2E2E2E] dark:bg-[#171717] dark:text-[#F6F2EA]"
                          }`}
                        >
                          {editingMessageId === message._id ? (
                            <div className="space-y-2">
                              <textarea
                                value={editingBody}
                                onChange={(event) => setEditingBody(event.target.value)}
                                rows={3}
                                className="w-full rounded-xl border border-[#DED7CC] bg-white px-3 py-2 text-sm text-[#181512] outline-none focus:border-[#FF5C00] dark:border-[#3A342C] dark:bg-[#111111] dark:text-[#F6F2EA]"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingMessageId(null);
                                    setEditingBody("");
                                  }}
                                  className="rounded-lg border border-[#DED7CC] px-3 py-1 text-xs font-medium text-[#5E564B] transition hover:border-[#C23B00] hover:text-[#C23B00] dark:border-[#3A342C] dark:text-[#C8C2B7]"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => void handleSaveEdit()}
                                  className="rounded-lg bg-[#FF5C00] px-3 py-1 text-xs font-medium text-white transition hover:bg-[#E65400]"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p
                                className={`text-sm leading-relaxed break-words whitespace-pre-wrap ${
                                  isDeleted ? "italic" : ""
                                }`}
                              >
                                {isDeleted ? "Message deleted" : message.body}
                              </p>

                              {!isDeleted && message.attachment ? (
                                <AttachmentCard
                                  attachment={message.attachment}
                                  compact={isMe}
                                />
                              ) : null}

                              <div className="mt-1 flex justify-end gap-1 text-[10px]">
                                {message.editedAt && !isDeleted ? (
                                  <span
                                    className={
                                      isMe ? "text-white/70" : "text-[#8A8174] dark:text-[#8F887B]"
                                    }
                                  >
                                    edited
                                  </span>
                                ) : null}
                                <span
                                  className={isMe ? "text-white/70" : "text-[#8A8174] dark:text-[#8F887B]"}
                                >
                                  {formatMessageTime(message.createdAt)}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {!isDeleted && editingMessageId !== message._id && activeReactions.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {activeReactions.map((reaction) => {
                            const reactionKey = `${message._id}:${reaction.emoji}`;
                            return (
                              <button
                                key={reaction.emoji}
                                onClick={() =>
                                  void handleToggleReaction(message._id, reaction.emoji)
                                }
                                disabled={pendingReactionKey === reactionKey}
                                className={`rounded-full border px-2 py-1 text-xs transition ${
                                  reaction.reactedByMe
                                    ? "border-[#FFB38A] bg-[#FFF1E8] text-[#C95A00] dark:border-[#6E402A] dark:bg-[#2A1B14] dark:text-[#FFAA73]"
                                    : "border-[#E7E0D6] bg-white text-[#5E564B] hover:border-[#FFB38A] hover:text-[#C95A00] dark:border-[#3A342C] dark:bg-[#171717] dark:text-[#C8C2B7]"
                                } disabled:opacity-50`}
                              >
                                <span>{reaction.emoji}</span>
                                <span className="ml-1">{reaction.count}</span>
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#FFD5C1] bg-white dark:border-[#4B2D20] dark:bg-[#171717]">
              <FaComments className="text-2xl text-[#FF6B35]" />
            </div>
            <p className="text-sm font-semibold text-[#181512] dark:text-[#F6F2EA]">
              No messages yet in {title}
            </p>
            <p className="mt-1 text-xs text-[#8A8174] dark:text-[#8F887B]">
              Start the conversation to bring this channel to life.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-shrink-0 items-end gap-2 border-t border-[#E5E0D8] bg-white px-5 py-4 dark:border-[#2A2A2A] dark:bg-[#111111]">
        <textarea
          ref={inputRef}
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          rows={1}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void handleSend();
            }
          }}
          placeholder={
            canPost
              ? `Message #${channelSlug}`
              : "Only the workspace host can post here"
          }
          disabled={!canPost || isSending || isUploading}
          className="min-h-[50px] max-h-40 flex-1 resize-none overflow-y-auto rounded-xl border border-[#DED7CC] bg-[#FCFBF8] px-4 py-3 text-sm text-[#181512] outline-none transition-all placeholder:text-[#9B9287] focus:border-[#FF5C00] disabled:cursor-not-allowed disabled:bg-[#F7F5F0] dark:border-[#3A342C] dark:bg-[#171717] dark:text-[#F6F2EA] dark:placeholder:text-[#7E766B] dark:disabled:bg-[#151515]"
        />
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(event) => void handleAttachmentSelected(event)}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={!canPost || isSending || isUploading}
          className="flex items-center justify-center rounded-xl border border-[#DED7CC] bg-white px-4 text-[#5E564B] transition hover:border-[#FF5C00] hover:text-[#FF5C00] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#3A342C] dark:bg-[#171717] dark:text-[#C8C2B7]"
          title="Attach image or file"
        >
          {isUploading ? <FaImage className="animate-pulse text-sm" /> : <FaPaperclip className="text-sm" />}
        </button>
        <button
          onClick={() => void handleSend()}
          disabled={!canPost || isSending || isUploading || !newMessage.trim()}
          className="flex items-center justify-center rounded-xl bg-[#FF5C00] px-4 text-white transition hover:bg-[#E65400] disabled:cursor-not-allowed disabled:opacity-50"
          title={canPost ? "Send message" : "Posting is restricted"}
        >
          {canPost ? (
            isSending ? <FaXmark className="text-sm" /> : <FaPaperPlane className="text-sm" />
          ) : (
            <FaLock className="text-sm" />
          )}
        </button>
      </div>
    </div>
  );
}

function RealtimeWorkspaceChat({
  workspaceId,
  channelSlug,
  title,
  description,
  currentUserRole,
  canPost = true,
  pinnedContent,
}: Pick<
  WorkspaceChatProps,
  | "workspaceId"
  | "channelSlug"
  | "title"
  | "description"
  | "currentUserRole"
  | "canPost"
  | "pinnedContent"
>) {
  return (
    <SyncedRealtimeWorkspaceChat
      workspaceId={workspaceId}
      channelSlug={channelSlug}
      title={title}
      description={description}
      currentUserRole={currentUserRole}
      canPost={canPost}
      pinnedContent={pinnedContent}
    />
  );
}

export function WorkspaceChat(props: WorkspaceChatProps) {
  if (!props.convexConfigured) {
    return (
      <SetupNotice reason="This environment is missing NEXT_PUBLIC_CONVEX_URL, so the Convex chat client never starts." />
    );
  }

  if (props.chatPreparing) {
    return (
      <div className="flex h-full items-center justify-center bg-[#FCFBF8] px-6 text-center dark:bg-[#0D0D0D]">
        <div>
          <p className="text-sm font-semibold text-[#181512] dark:text-[#F6F2EA]">
            Preparing realtime workspace chat...
          </p>
          <p className="mt-2 text-sm text-[#7A7267] dark:text-[#A8A093]">
            Syncing your workspace access with Convex.
          </p>
        </div>
      </div>
    );
  }

  if (!props.chatReady) {
    return (
      <SetupNotice
        reason={
          props.chatUnavailableReason ||
          "Convex is configured, but your workspace chat access could not be synced."
        }
      />
    );
  }

  return <RealtimeWorkspaceChat {...props} />;
}
