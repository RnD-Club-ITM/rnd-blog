"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { getImageUrl } from "@/lib/sanity/client";
import { WorkspaceChat } from "@/components/workspace/WorkspaceChat";
import { WorkspaceBoard } from "@/components/workspace/WorkspaceBoard";
import { WorkspacePlanning } from "@/components/workspace/WorkspacePlanning";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  FaBookOpen,
  FaCheck,
  FaCircle,
  FaClock,
  FaCodeBranch,
  FaFileLines,
  FaFolderOpen,
  FaHashtag,
  FaLink,
  FaPlus,
  FaRegNoteSticky,
  FaTrash,
  FaUsers,
} from "react-icons/fa6";

interface WorkspaceLayoutProps {
  collaboration: Collaboration;
  chatContext: ChatContext;
}

type ViewKey =
  | "announcements"
  | "chat"
  | "updates"
  | "planning"
  | "resources"
  | "canvas";

interface WorkspaceResource {
  id: string;
  title: string;
  url: string;
  type: string;
  description: string;
}

interface WorkspaceMember {
  _id: string;
  name?: string;
  avatar?: unknown;
  tier?: string;
  university?: string;
  clerkId?: string;
}

interface WorkspaceApplicant {
  _key: string;
  status: string;
  applicationText?: string;
  user?: WorkspaceMember;
}

interface WorkspaceMessage {
  _key: string;
  text: string;
  timestamp: string;
  user?: WorkspaceMember;
}

interface Collaboration {
  _id: string;
  _createdAt?: string;
  projectName: string;
  description: string;
  skillsNeeded?: string[];
  duration?: string;
  commitment?: string;
  maxPositions?: number;
  status?: string;
  githubRepo?: string;
  designDoc?: string;
  messages?: WorkspaceMessage[];
  postedBy?: WorkspaceMember;
  teamMembers?: WorkspaceMember[];
  applicants?: WorkspaceApplicant[];
}

interface SidebarItem {
  key: ViewKey;
  label: string;
  icon: string;
  accent?: string;
  count?: number;
}

interface ChannelUnreadState {
  channelSlug: string;
  lastReadAt: number;
  latestMessageAt?: number;
  unreadCount: number;
}

interface QuickLink {
  label: string;
  href: string;
  icon: React.ReactNode;
  action?: () => void;
}

interface ChatContext {
  convexConfigured: boolean;
  currentUserRole: "host" | "member";
  memberName: string;
  memberAvatarUrl?: string;
}

interface PlanningTaskSummary {
  _id: string;
  completionCount?: number;
}

interface PlanningColumnSummary {
  _id: string;
  title: string;
  tasks: PlanningTaskSummary[];
}

interface PlanningBoardSummary {
  columns: PlanningColumnSummary[];
  completedMembersCount?: number;
}

const DEFAULT_CHAT_CHANNELS = [
  {
    slug: "announcements",
    name: "Announcements",
    kind: "announcements" as const,
    position: 0,
  },
  {
    slug: "team-chat",
    name: "Team Chat",
    kind: "standard" as const,
    position: 1,
  },
  {
    slug: "updates",
    name: "Updates",
    kind: "standard" as const,
    position: 2,
  },
];

const statusConfig: Record<string, { label: string; tone: string }> = {
  open: { label: "Open", tone: "bg-emerald-50 text-emerald-700" },
  "in-progress": {
    label: "In Progress",
    tone: "bg-amber-50 text-amber-700",
  },
  completed: { label: "Completed", tone: "bg-blue-50 text-blue-700" },
};

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatWorkspaceDate(value?: string) {
  if (!value) return "Recently";
  try {
    return format(new Date(value), "MMM d, yyyy");
  } catch {
    return "Recently";
  }
}

function seedResources(): WorkspaceResource[] {
  return [];
}

const LEGACY_RESOURCE_IDS = new Set(["repo", "doc", "scope"]);

function sanitizeStoredResources(resources: WorkspaceResource[] | undefined) {
  if (!resources?.length) return [];
  return resources.filter((resource) => !LEGACY_RESOURCE_IDS.has(resource.id));
}

function MemberAvatar({
  member,
  size = 32,
}: {
  member: WorkspaceMember | undefined;
  size?: number;
}) {
  const image = getImageUrl(member?.avatar);

  if (image) {
    return (
      <Image
        src={image}
        alt={member?.name || "Member"}
        width={size}
        height={size}
        className="rounded-full object-cover border border-white/70"
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-700 text-white font-semibold"
      style={{ width: size, height: size, fontSize: Math.max(10, size / 2.5) }}
    >
      {getInitials(member?.name)}
    </div>
  );
}

function WorkspaceChannelSidebarContent({
  activeView,
  onSelect,
  unreadSummary,
  unreadUnavailableReason,
}: {
  activeView: ViewKey;
  onSelect: (view: ViewKey) => void;
  unreadSummary?: ChannelUnreadState[];
  unreadUnavailableReason?: string;
}) {
  const unreadCountByKey: Partial<Record<ViewKey, number>> = {
    announcements:
      unreadSummary?.find((entry) => entry.channelSlug === "announcements")
        ?.unreadCount ?? 0,
    chat:
      unreadSummary?.find((entry) => entry.channelSlug === "team-chat")
        ?.unreadCount ?? 0,
    updates:
      unreadSummary?.find((entry) => entry.channelSlug === "updates")
        ?.unreadCount ?? 0,
  };

  return (
    <div className="mt-2 px-2">
      {([
        {
          key: "announcements",
          label: "announcements",
          icon: "#",
        },
        {
          key: "chat",
          label: "team-chat",
          icon: "#",
        },
        { key: "updates", label: "updates", icon: "#" },
      ] as SidebarItem[]).map((item) => {
        const unreadCount = unreadCountByKey[item.key] ?? 0;

        return (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
              activeView === item.key
                ? "bg-[#252525] text-white"
                : "hover:bg-[#1A1A1A] hover:text-white"
            }`}
          >
            <span className="w-4 shrink-0 font-mono text-xs text-[#6E665C]">
              {item.icon}
            </span>
            <span>{item.label}</span>
            {unreadCount > 0 ? (
              <span className="ml-auto rounded-full bg-[#FF5C00] px-2 py-0.5 font-mono text-[10px] text-white">
                {unreadCount}
              </span>
            ) : null}
          </button>
        );
      })}
      {unreadUnavailableReason ? (
        <p className="px-3 pt-3 text-[11px] leading-5 text-[#7C746A]">
          {unreadUnavailableReason}
        </p>
      ) : null}
    </div>
  );
}

function WorkspaceChannelSidebar({
  activeView,
  unreadEnabled,
  unreadUnavailableReason,
  onSelect,
  workspaceId,
}: {
  activeView: ViewKey;
  unreadEnabled: boolean;
  unreadUnavailableReason?: string;
  onSelect: (view: ViewKey) => void;
  workspaceId: string;
}) {
  if (!unreadEnabled) {
    return (
      <WorkspaceChannelSidebarContent
        activeView={activeView}
        onSelect={onSelect}
        unreadUnavailableReason={unreadUnavailableReason}
      />
    );
  }

  return (
    <WorkspaceChannelSidebarWithUnread
      activeView={activeView}
      onSelect={onSelect}
      workspaceId={workspaceId}
    />
  );
}

function WorkspaceChannelSidebarWithUnread({
  activeView,
  onSelect,
  workspaceId,
}: {
  activeView: ViewKey;
  onSelect: (view: ViewKey) => void;
  workspaceId: string;
}) {
  const unreadSummary = useQuery(api.messages.unreadSummary, {
    workspaceId,
  }) as ChannelUnreadState[] | undefined;

  return (
    <WorkspaceChannelSidebarContent
      activeView={activeView}
      onSelect={onSelect}
      unreadSummary={unreadSummary}
    />
  );
}

export function WorkspaceLayout({
  collaboration,
  chatContext,
}: WorkspaceLayoutProps) {
  const router = useRouter();
  const { isLoading: chatAuthLoading, isAuthenticated } = useConvexAuth();
  const syncWorkspaceAccess = useMutation(api.workspaces.syncWorkspaceAccess);
  const [activeView, setActiveView] = useState<ViewKey>("announcements");
  const [newResourceTitle, setNewResourceTitle] = useState("");
  const [newResourceUrl, setNewResourceUrl] = useState("");
  const [isUpdatingApplicant, setIsUpdatingApplicant] = useState<string | null>(
    null,
  );
  const [chatSyncStatus, setChatSyncStatus] = useState<"idle" | "ready" | "error">(
    "idle",
  );
  const [chatSyncError, setChatSyncError] = useState<string | undefined>();

  const statusKey = collaboration.status ?? "open";
  const status = statusConfig[statusKey] || statusConfig.open;

  const acceptedApplicants = (collaboration.applicants || [])
    .filter((applicant) => applicant.status === "accepted")
    .map((applicant) => applicant.user)
    .filter((member): member is WorkspaceMember => Boolean(member?._id));

  const pendingApplicants = (collaboration.applicants || []).filter(
    (applicant) => applicant.status === "pending",
  );

  const uniqueMembers = new Map<string, WorkspaceMember>();
  [
    collaboration.postedBy,
    ...(collaboration.teamMembers || []),
    ...acceptedApplicants,
  ].forEach((member) => {
    if (member?._id) uniqueMembers.set(member._id, member);
  });

  const allMembers = Array.from(uniqueMembers.values());
  const memberCount = allMembers.length;
  const maxPositions = collaboration.maxPositions || 3;
  const occupancy = Math.min(
    100,
    Math.round((memberCount / Math.max(maxPositions + 1, 1)) * 100),
  );

  const storageKey = `spark-workspace-${collaboration._id}`;
  const seededResources = useMemo(() => seedResources(), []);
  const [resources, setResources] = useState<WorkspaceResource[]>(() => {
    if (typeof window === "undefined") return seededResources;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (!stored) return seededResources;
      const parsed = JSON.parse(stored) as { resources?: WorkspaceResource[] };
      const cleaned = sanitizeStoredResources(parsed.resources);
      return cleaned.length ? cleaned : seededResources;
    } catch {
      return seededResources;
    }
  });
 
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify({ resources }));
  }, [resources, storageKey]);
  const quickLinks: QuickLink[] = [
    ...(collaboration.githubRepo
      ? [
          {
            label: "Repository",
            href: collaboration.githubRepo,
            icon: <FaCodeBranch className="text-xs" />,
          },
        ]
      : []),
    ...(collaboration.designDoc
      ? [
          {
            label: "Design doc",
            href: collaboration.designDoc,
            icon: <FaRegNoteSticky className="text-xs" />,
          },
        ]
      : []),
    {
      label: "Workspace resources",
      href: "#resources",
      icon: <FaBookOpen className="text-xs" />,
      action: () => setActiveView("resources"),
    },
    {
      label: "Planning board",
      href: "#planning",
      icon: <FaCheck className="text-xs" />,
      action: () => setActiveView("planning"),
    },
  ];

  const addResource = () => {
    const title = newResourceTitle.trim();
    const url = newResourceUrl.trim();
    if (!title || !url) return;

    setResources((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        title,
        url,
        type: "Link",
        description: "Added by the team to support current collaboration work.",
      },
    ]);
    setNewResourceTitle("");
    setNewResourceUrl("");
  };

  const deleteResource = (resourceId: string) => {
    setResources((current) =>
      current.filter((resource) => resource.id !== resourceId),
    );
  };

  const updateApplicantStatus = async (
    applicantKey: string,
    decision: "accepted" | "rejected",
  ) => {
    setIsUpdatingApplicant(applicantKey);
    try {
      const response = await fetch("/api/collaborate/applicants/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collaborationId: collaboration._id,
          applicantKey,
          decision,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error || "Failed to update applicant");
      }

      toast.success(
        decision === "accepted"
          ? "Collaborator accepted successfully."
          : "Join request rejected.",
      );
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update applicant",
      );
    } finally {
      setIsUpdatingApplicant(null);
    }
  };

  useEffect(() => {
    if (!chatContext.convexConfigured) {
      return;
    }

    if (chatAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        await syncWorkspaceAccess({
          workspaceId: collaboration._id,
          role: chatContext.currentUserRole,
          memberName: chatContext.memberName,
          memberAvatarUrl: chatContext.memberAvatarUrl,
          channels: DEFAULT_CHAT_CHANNELS,
        });

        if (!cancelled) {
          setChatSyncStatus("ready");
        }
      } catch (error) {
        if (!cancelled) {
          setChatSyncStatus("error");
          setChatSyncError(
            error instanceof Error
              ? error.message
              : "Workspace chat access could not be synced.",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    chatAuthLoading,
    chatContext.convexConfigured,
    chatContext.currentUserRole,
    chatContext.memberAvatarUrl,
    chatContext.memberName,
    collaboration._id,
    isAuthenticated,
    syncWorkspaceAccess,
  ]);

  const chatReady = chatContext.convexConfigured && chatSyncStatus === "ready";
  const chatUnavailableReason = !chatContext.convexConfigured
    ? "Realtime chat is unavailable because NEXT_PUBLIC_CONVEX_URL is missing."
    : !chatAuthLoading && !isAuthenticated
      ? "Clerk sign-in is active, but Convex is not seeing an authenticated session yet. Sign out and sign back in once after enabling the Clerk Convex integration."
      : chatSyncStatus === "error"
        ? chatSyncError
        : undefined;
  const chatPreparing =
    chatContext.convexConfigured &&
    (chatAuthLoading || (isAuthenticated && chatSyncStatus === "idle"));
  const planningBoard = useQuery(
    api.planning.board,
    chatReady ? { workspaceId: collaboration._id } : "skip",
  ) as PlanningBoardSummary | undefined;
  const planningColumns = planningBoard?.columns || [];
  const totalPlanningTasks = planningColumns.reduce(
    (sum, column) => sum + column.tasks.length,
    0,
  );
  const completedPlanningTasks = planningColumns
    .reduce(
      (sum, column) =>
        sum + column.tasks.filter((task) => (task.completionCount ?? 0) > 0).length,
      0,
    );
  const completedMembersCount = planningBoard?.completedMembersCount ?? 0;
  const sprintProgress = totalPlanningTasks
    ? Math.round((completedPlanningTasks / totalPlanningTasks) * 100)
    : 0;
  const planningUnavailableReason = !chatContext.convexConfigured
    ? "Shared planning is unavailable because NEXT_PUBLIC_CONVEX_URL is missing."
    : !chatAuthLoading && !isAuthenticated
      ? "Clerk sign-in is active, but Convex is not seeing an authenticated session yet."
      : chatSyncStatus === "error"
        ? chatSyncError
        : undefined;

  const renderView = () => {
    if (activeView === "announcements") {
      return (
        <div className="flex h-full flex-col overflow-y-auto bg-[#FCFBF8]">
          <div className="border-b border-[#E5E0D8] bg-white px-6 py-5">
            <div className="flex items-center gap-3 text-sm font-semibold text-[#111]">
              <FaHashtag className="text-xs text-[#8A8174]" />
              announcements
            </div>
            <p className="mt-1 text-sm text-[#7A7267]">
              Project brief and host updates. This is the home base for the workspace.
            </p>
          </div>

          <div className="px-6 py-5">
            <div className="mb-4 flex justify-center">
              <span className="rounded-full border border-[#E5E0D8] bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[#8A8174]">
                {formatWorkspaceDate(collaboration._createdAt)}
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#E5E0D8] bg-white shadow-[0_12px_40px_rgba(17,17,17,0.05)]">
              <div className="bg-[#111111] px-6 py-6 text-white">
                <div className="text-[11px] uppercase tracking-[0.2em] text-[#FF8E56]">
                  Project Brief
                </div>
                <h2 className="mt-2 text-2xl font-black leading-tight">
                  {collaboration.projectName}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/70">
                  <span>{collaboration.postedBy?.name || "Project lead"}</span>
                  <span>•</span>
                  <span>{memberCount} members active</span>
                  <span>•</span>
                  <span>{pendingApplicants.length} pending request(s)</span>
                </div>
              </div>

              <div className="space-y-6 px-6 py-6">
                <section>
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8A8174]">
                    Problem Statement
                  </h3>
                  <p className="mt-2 text-[15px] leading-7 text-[#4E473E]">
                    {collaboration.description}
                  </p>
                </section>

                <section>
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8A8174]">
                    What This Team Needs
                  </h3>
                  <p className="mt-2 text-[15px] leading-7 text-[#4E473E]">
                    {collaboration.skillsNeeded?.length
                      ? `Looking for collaborators across ${collaboration.skillsNeeded.join(", ")}.`
                      : "Looking for collaborators who can help move the project from idea to execution."}{" "}
                    {collaboration.commitment
                      ? `Expected weekly commitment: ${collaboration.commitment}.`
                      : "Commitment can be shaped with the team."}
                  </p>
                </section>

                <section>
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8A8174]">
                    Stack And Workstreams
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(collaboration.skillsNeeded || []).map((skill: string) => (
                      <span
                        key={skill}
                        className="rounded-md bg-[#FFF1E8] px-3 py-1.5 font-mono text-xs font-medium text-[#D94E00]"
                      >
                        {skill}
                      </span>
                    ))}
                    {!collaboration.skillsNeeded?.length && (
                      <span className="rounded-md bg-[#F3F0EA] px-3 py-1.5 font-mono text-xs text-[#6F675B]">
                        General collaboration
                      </span>
                    )}
                  </div>
                </section>

                <section className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-[#E8E2D9] bg-[#FCFBF8] p-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-[#8A8174]">
                      Duration
                    </div>
                    <div className="mt-2 text-sm font-semibold text-[#1B1814]">
                      {collaboration.duration || "Flexible"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#E8E2D9] bg-[#FCFBF8] p-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-[#8A8174]">
                      Current Progress
                    </div>
                    <div className="mt-2 text-sm font-semibold text-[#1B1814]">
                      {completedMembersCount} member(s) have completed work,{" "}
                      {completedPlanningTasks} task(s) touched
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-[#E5E0D8] bg-white p-5">
              <div className="flex items-center gap-3">
                <MemberAvatar member={collaboration.postedBy} size={36} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-[#181512]">
                      {collaboration.postedBy?.name || "Project lead"}
                    </p>
                    <span className="rounded bg-[#FFF1E8] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#D94E00]">
                      Host
                    </span>
                  </div>
                  <p className="text-xs text-[#8A8174]">
                    Last updated this workspace and aligned the next sprint.
                  </p>
                </div>
                <span className="ml-auto text-[11px] font-mono text-[#8A8174]">
                  {formatWorkspaceDate(collaboration._createdAt)}
                </span>
              </div>
            </div>

            <div className="mt-5 h-[540px] overflow-hidden rounded-2xl border border-[#E5E0D8] bg-white">
              <WorkspaceChat
                workspaceId={collaboration._id}
                channelSlug="announcements"
                title="announcements"
                description="Host-only updates, decisions, and key milestones."
                convexConfigured={chatContext.convexConfigured}
                chatReady={chatReady}
                chatPreparing={chatPreparing}
                chatUnavailableReason={chatUnavailableReason}
                memberName={chatContext.memberName}
                memberAvatarUrl={chatContext.memberAvatarUrl}
                currentUserRole={chatContext.currentUserRole}
                canPost={chatContext.currentUserRole === "host"}
              />
            </div>
          </div>
        </div>
      );
    }

    if (activeView === "chat") {
      return (
        <WorkspaceChat
          workspaceId={collaboration._id}
          channelSlug="team-chat"
          title="team-chat"
          description="The main realtime conversation for the collaboration workspace."
          convexConfigured={chatContext.convexConfigured}
          chatReady={chatReady}
          chatPreparing={chatPreparing}
          chatUnavailableReason={chatUnavailableReason}
          memberName={chatContext.memberName}
          memberAvatarUrl={chatContext.memberAvatarUrl}
          currentUserRole={chatContext.currentUserRole}
        />
      );
    }

    if (activeView === "updates") {
      return (
        <WorkspaceChat
          workspaceId={collaboration._id}
          channelSlug="updates"
          title="updates"
          description="Post progress updates, blockers, and async check-ins."
          convexConfigured={chatContext.convexConfigured}
          chatReady={chatReady}
          chatPreparing={chatPreparing}
          chatUnavailableReason={chatUnavailableReason}
          memberName={chatContext.memberName}
          memberAvatarUrl={chatContext.memberAvatarUrl}
          currentUserRole={chatContext.currentUserRole}
        />
      );
    }

    if (activeView === "planning") {
      return (
        <WorkspacePlanning
          workspaceId={collaboration._id}
          planningReady={chatReady}
          planningPreparing={chatPreparing}
          planningUnavailableReason={planningUnavailableReason}
          canEdit={chatContext.currentUserRole === "host"}
          memberCount={memberCount}
        />
      );
    }

    if (activeView === "resources") {
      return (
        <div className="flex h-full flex-col overflow-y-auto bg-[#FCFBF8]">
          <div className="border-b border-[#E5E0D8] bg-white px-6 py-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-3 text-sm font-semibold text-[#111]">
                  <span className="font-mono text-sm text-[#8A8174]">◈</span>
                  resources
                </div>
                <p className="mt-1 text-sm text-[#7A7267]">
                  Papers, repos, docs, and references your team can keep in one place.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <input
                  value={newResourceTitle}
                  onChange={(event) => setNewResourceTitle(event.target.value)}
                  placeholder="Resource title"
                  className="rounded-lg border border-[#DED7CC] bg-[#FCFBF8] px-3 py-2 text-sm outline-none placeholder:text-[#9B9287] focus:border-[#FF5C00]"
                />
                <input
                  value={newResourceUrl}
                  onChange={(event) => setNewResourceUrl(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && addResource()}
                  placeholder="https://..."
                  className="rounded-lg border border-[#DED7CC] bg-[#FCFBF8] px-3 py-2 text-sm outline-none placeholder:text-[#9B9287] focus:border-[#FF5C00]"
                />
                <button
                  onClick={addResource}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF5C00] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#E65400]"
                >
                  <FaPlus className="text-xs" />
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 px-6 py-6 md:grid-cols-2 xl:grid-cols-3">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="rounded-2xl border border-[#E5E0D8] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#FF5C00]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8A8174]">
                    {resource.type}
                  </div>
                  <button
                    onClick={() => deleteResource(resource.id)}
                    className="rounded-md border border-[#E5E0D8] p-1.5 text-[#7A7267] transition hover:border-[#FF5C00] hover:text-[#FF5C00]"
                    aria-label="Delete resource"
                  >
                    <FaTrash className="text-[10px]" />
                  </button>
                </div>
                <a
                  href={resource.url}
                  target={resource.url.startsWith("http") ? "_blank" : undefined}
                  rel={
                    resource.url.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="block"
                >
                  <h3 className="mt-2 text-base font-semibold leading-6 text-[#1B1814]">
                    {resource.title}
                  </h3>
                  <p className="mt-2 truncate font-mono text-xs text-[#3146D7]">
                    {resource.url}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[#5E564B]">
                    {resource.description}
                  </p>
                </a>
              </div>
            ))}
            {!resources.length && (
              <div className="rounded-2xl border border-dashed border-[#E5E0D8] bg-white p-6 text-sm text-[#7A7267]">
                No shared resources yet. Add your first repo, doc, paper, or reference link here.
              </div>
            )}
          </div>
        </div>
      );
    }

    return <WorkspaceBoard collaborationId={collaboration._id} />;
  };

  return (
    <div className="flex h-full flex-col bg-[#F7F5F0] text-[#111111]">
      <div className="border-b border-[#E4DED5] bg-white px-4 py-3 md:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF5C00] font-black text-white">
              {collaboration.projectName?.charAt(0) || "P"}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-lg font-black md:text-xl">
                  {collaboration.projectName}
                </h1>
                <span
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold ${status.tone}`}
                >
                  {status.label}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#7A7267]">
                <span>Host: {collaboration.postedBy?.name || "Unknown"}</span>
                <span>•</span>
                <span>
                  {memberCount} / {maxPositions + 1} members
                </span>
                <span>•</span>
                <span>{completedMembersCount} member(s) completed work</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(collaboration.skillsNeeded || []).slice(0, 4).map((skill: string) => (
                  <span
                    key={skill}
                    className="rounded-md bg-[#F3F0EA] px-2.5 py-1 font-mono text-[11px] text-[#5F584E]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex -space-x-2">
              {allMembers.slice(0, 4).map((member) => (
                <div key={member._id} className="rounded-full border-2 border-white">
                  <MemberAvatar member={member} size={34} />
                </div>
              ))}
            </div>
            {collaboration.githubRepo && (
              <a
                href={collaboration.githubRepo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[#E5E0D8] bg-white px-3 py-2 text-sm font-medium text-[#111] transition hover:border-[#FF5C00] hover:text-[#FF5C00]"
              >
                <FaCodeBranch className="text-xs" />
                Repo
              </a>
            )}
            {collaboration.designDoc && (
              <a
                href={collaboration.designDoc}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[#E5E0D8] bg-white px-3 py-2 text-sm font-medium text-[#111] transition hover:border-[#FF5C00] hover:text-[#FF5C00]"
              >
                <FaFileLines className="text-xs" />
                Docs
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[250px] shrink-0 flex-col bg-[#111111] text-[#CFC7BC] md:flex">
          <div className="px-4 pt-5">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#5D564D]">
              Project Space
            </div>
          </div>
          <WorkspaceChannelSidebar
            activeView={activeView}
            unreadEnabled={chatReady}
            unreadUnavailableReason={
              chatPreparing ? "Preparing unread state..." : undefined
            }
            onSelect={setActiveView}
            workspaceId={collaboration._id}
          />

          <div className="mx-4 my-4 h-px bg-[#242424]" />

          <div className="px-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#5D564D]">
              Work
            </div>
          </div>
          <div className="mt-2 px-2">
            {[
              { key: "planning", label: "planning", icon: "▦" },
              { key: "resources", label: "resources", icon: "◈" },
              { key: "canvas", label: "canvas", icon: "✎" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveView(item.key as ViewKey)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  activeView === item.key
                    ? "bg-[#252525] text-white"
                    : "hover:bg-[#1A1A1A] hover:text-white"
                }`}
              >
                <span className="w-4 shrink-0 font-mono text-xs text-[#6E665C]">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="mx-4 my-4 h-px bg-[#242424]" />

          <div className="px-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#5D564D]">
              Join Requests
            </div>
          </div>
          <div className="mt-2 space-y-2 px-4">
            {pendingApplicants.slice(0, 4).map((applicant) => (
              <div
                key={applicant._key}
                className="rounded-lg bg-[#181818] px-3 py-3"
              >
                <div className="flex items-center gap-3">
                  <MemberAvatar member={applicant.user} size={26} />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-white">
                      {applicant.user?.name || "Pending applicant"}
                    </p>
                    <p className="font-mono text-[10px] text-[#767067]">
                      wants to join
                    </p>
                  </div>
                </div>
                {applicant.applicationText ? (
                  <p className="mt-2 text-xs leading-5 text-[#A69F95]">
                    {applicant.applicationText}
                  </p>
                ) : null}
                {chatContext.currentUserRole === "host" ? (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() =>
                        void updateApplicantStatus(applicant._key, "accepted")
                      }
                      disabled={isUpdatingApplicant === applicant._key}
                      className="flex-1 rounded-lg bg-[#FF5C00] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#E65400] disabled:opacity-60"
                    >
                      {isUpdatingApplicant === applicant._key
                        ? "Updating..."
                        : "Accept"}
                    </button>
                    <button
                      onClick={() =>
                        void updateApplicantStatus(applicant._key, "rejected")
                      }
                      disabled={isUpdatingApplicant === applicant._key}
                      className="flex-1 rounded-lg border border-[#403A31] px-3 py-2 text-xs font-semibold text-[#D8D1C6] transition hover:border-[#FF5C00] hover:text-white disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
            {!pendingApplicants.length && (
              <div className="rounded-lg border border-dashed border-[#2A2A2A] px-3 py-4 text-sm text-[#767067]">
                No pending requests right now.
              </div>
            )}
          </div>

          <div className="mt-auto border-t border-[#242424] px-4 py-4">
            <div className="flex items-center gap-3">
              <MemberAvatar member={collaboration.postedBy} size={30} />
              <div>
                <p className="text-sm text-white">{collaboration.postedBy?.name}</p>
                <p className="font-mono text-[10px] text-[#6E665C]">Host</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-[#E4DED5] bg-white px-4 py-3 md:hidden">
            <div className="flex gap-2 overflow-x-auto">
              {[
                "announcements",
                "chat",
                "planning",
                "resources",
                "canvas",
              ].map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view as ViewKey)}
                  className={`whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium ${
                    activeView === view
                      ? "bg-[#FF5C00] text-white"
                      : "bg-[#F1EDE5] text-[#5F584E]"
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1">{renderView()}</div>
        </div>

        <aside className="hidden w-[280px] shrink-0 border-l border-[#E4DED5] bg-white xl:flex xl:flex-col">
          <div className="px-5 py-5">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8A8174]">
              Team
            </div>
            <div className="mt-4 space-y-3">
              {allMembers.map((member) => {
                const isLead = member._id === collaboration.postedBy?._id;
                return (
                  <div key={member._id} className="flex items-center gap-3">
                    <div className="relative">
                      <MemberAvatar member={member} size={34} />
                      <FaCircle className="absolute -bottom-0.5 -right-0.5 text-[10px] text-emerald-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#181512]">
                        {member.name}
                      </p>
                      <p className="truncate text-xs text-[#8A8174]">
                        {isLead ? "Project lead" : member.university || "Collaborator"}
                      </p>
                    </div>
                    {isLead && (
                      <span className="rounded bg-[#FFF1E8] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#D94E00]">
                        Lead
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mx-5 h-px bg-[#EAE4DA]" />

          <div className="px-5 py-5">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8A8174]">
              Workspace Snapshot
            </div>

            {chatContext.currentUserRole === "host" ? (
              <div className="mt-4 rounded-2xl border border-[#E5E0D8] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#1B1814]">
                  <FaClock className="text-xs text-[#FF5C00]" />
                  Sprint Progress
                </div>
                <p className="mt-2 font-mono text-xs text-[#8A8174]">
                  {completedMembersCount} of {memberCount} members have completed at least one task
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#EEE8DE]">
                  <div
                    className="h-full rounded-full bg-[#FF5C00]"
                    style={{ width: `${sprintProgress}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs text-[#7A7267]">
                  <span>{sprintProgress}% done</span>
                  <span>{completedPlanningTasks} task(s) touched</span>
                </div>
              </div>
            ) : null}

            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-[#E5E0D8] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#1B1814]">
                  <FaUsers className="text-xs text-[#FF5C00]" />
                  Capacity
                </div>
                <p className="mt-2 text-sm text-[#5E564B]">
                  {memberCount} active member(s) across {maxPositions + 1} planned seats.
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#EEE8DE]">
                  <div
                    className="h-full rounded-full bg-[#111111]"
                    style={{ width: `${occupancy}%` }}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-[#E5E0D8] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#1B1814]">
                  <FaFolderOpen className="text-xs text-[#FF5C00]" />
                  Resources
                </div>
                <p className="mt-2 text-sm text-[#5E564B]">
                  {resources.length} saved resource(s) available to the team.
                </p>
              </div>
            </div>
          </div>

          <div className="mx-5 h-px bg-[#EAE4DA]" />

          <div className="flex-1 px-5 py-5">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8A8174]">
              Quick Links
            </div>
            <div className="mt-4 space-y-2">
              {quickLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={link.action}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      link.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="flex items-center gap-3 rounded-xl border border-[#E5E0D8] px-3 py-3 text-sm text-[#1B1814] transition hover:border-[#FF5C00] hover:text-[#FF5C00]"
                  >
                    {link.icon || <FaLink className="text-xs" />}
                    <span>{link.label}</span>
                  </a>
                ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
