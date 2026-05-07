import { client, queries } from "@/lib/sanity/client";
import { WorkspaceLayout } from "@/components/workspace/WorkspaceLayout";
import { Navigation } from "@/components/layout/Navigation";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getImageUrl } from "@/lib/sanity/client";
import { getOrCreateUser } from "@/lib/auth/user";

interface WorkspaceMember {
  _id: string;
  name?: string;
  avatar?: unknown;
  clerkId?: string;
}

interface WorkspaceApplicant {
  status: string;
  user?: WorkspaceMember;
}

export default async function WorkspacePage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();
  if (!userId) {
    return notFound();
  }

  await getOrCreateUser();

  const { id } = await params;
  const collaboration = await client
    .withConfig({ useCdn: false })
    .fetch(queries.getCollaborationById(id));

  if (!collaboration) {
    return notFound();
  }

  const applicants = (collaboration.applicants || []) as WorkspaceApplicant[];
  const acceptedApplicants = applicants
    .filter((applicant) => applicant.status === "accepted")
    .map((applicant) => applicant.user)
    .filter(Boolean);

  const uniqueMembers = new Map<string, WorkspaceMember>();
  [
    collaboration.postedBy,
    ...(collaboration.teamMembers || []),
    ...acceptedApplicants,
  ].forEach((member) => {
    if (member?._id) {
      uniqueMembers.set(member._id, member);
    }
  });

  const allMembers = Array.from(uniqueMembers.values());
  const currentMember = allMembers.find((member) => member?.clerkId === userId);

  if (!currentMember) {
    return notFound();
  }

  const currentUserRole =
    collaboration.postedBy?.clerkId === userId ? "host" : "member";

  return (
    <>
      <Navigation />
      <main className="relative z-0 h-[calc(100vh-80px)] overflow-hidden bg-background">
        <WorkspaceLayout
          collaboration={collaboration}
          chatContext={{
            convexConfigured: Boolean(process.env.NEXT_PUBLIC_CONVEX_URL),
            currentUserRole,
            currentUserClerkId: userId,
            memberName: currentMember.name || "Workspace member",
            memberAvatarUrl: getImageUrl(currentMember.avatar) || undefined,
          }}
        />
      </main>
    </>
  );
}
