import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { client } from "@/lib/sanity/client";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { collaborationId, memberUserId } = await req.json();

    if (!collaborationId || !memberUserId) {
      return NextResponse.json(
        { error: "Invalid member removal request" },
        { status: 400 },
      );
    }

    const collaboration = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "collaboration" && _id == $collaborationId][0]{
          _id,
          postedBy,
          "postedByClerkId": postedBy->clerkId,
          teamMembers,
          applicants
        }`,
        { collaborationId },
      );

    if (!collaboration?._id) {
      return NextResponse.json(
        { error: "Collaboration not found" },
        { status: 404 },
      );
    }

    if (collaboration.postedByClerkId !== userId) {
      return NextResponse.json(
        { error: "Only the project host can remove members" },
        { status: 403 },
      );
    }

    if (collaboration.postedBy?._ref === memberUserId) {
      return NextResponse.json(
        { error: "The project host cannot be removed" },
        { status: 400 },
      );
    }

    const currentTeamMembers = Array.isArray(collaboration.teamMembers)
      ? collaboration.teamMembers
      : [];
    const nextTeamMembers = currentTeamMembers.filter(
      (member: { _ref?: string }) => member?._ref !== memberUserId,
    );

    if (nextTeamMembers.length === currentTeamMembers.length) {
      return NextResponse.json(
        { error: "Member not found in this workspace" },
        { status: 404 },
      );
    }

    const nextApplicants = Array.isArray(collaboration.applicants)
      ? collaboration.applicants.map(
          (applicant: {
            status?: string;
            user?: { _ref?: string };
          }) =>
            applicant?.user?._ref === memberUserId &&
            applicant.status === "accepted"
              ? { ...applicant, status: "rejected" }
              : applicant,
        )
      : [];

    await client
      .patch(collaborationId)
      .set({
        teamMembers: nextTeamMembers,
        applicants: nextApplicants,
      })
      .commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing collaboration member:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 },
    );
  }
}
