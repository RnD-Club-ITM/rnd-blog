"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { getImageUrl } from "@/lib/sanity/client";
import { toast } from "sonner";
import Link from "next/link";
import { FaPaperPlane, FaClock, FaUsers } from "react-icons/fa6";
import { Badge } from "@/components/retroui/Badge";
import { Card } from "@/components/retroui/Card";
import { Button } from "@/components/retroui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProjectCardProps {
  project: {
    _id: string;
    projectName: string;
    description?: string;
    skillsNeeded?: string[];
    duration?: string;
    commitment?: string;
    maxPositions?: number;
    postedBy: {
      _id: string;
      name: string;
      avatar?: unknown;
      tier: number;
      clerkId?: string;
    };
    teamMembers?: { _id: string; clerkId?: string }[];
    applicantCount: number;
    applicants?: {
      status: string;
      user: { clerkId?: string };
    }[];
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { user } = useUser();
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [applicationText, setApplicationText] = useState("");
  const postedByImageUrl = getImageUrl(project.postedBy.avatar);

  // Check if user is a member or owner
  const isOwner = user && project.postedBy.clerkId === user.id;
  const isTeamMember =
    user && project.teamMembers?.some((member) => member.clerkId === user.id);
  const isAcceptedApplicant =
    user &&
    project.applicants?.some(
      (a) => a.user?.clerkId === user.id && a.status === "accepted",
    );

  const canEnter = isOwner || isTeamMember || isAcceptedApplicant;

  const openApplyDialog = () => {
    if (!user) {
      toast.error("Please sign in to apply");
      return;
    }

    setIsApplyDialogOpen(true);
  };

  const handleApply = async () => {
    setIsApplying(true);
    try {
      const res = await fetch("/api/collaborate/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project._id,
          applicationText: applicationText.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to apply");

      setHasApplied(true);
      setIsApplyDialogOpen(false);
      setApplicationText("");
      toast.success("Application sent successfully! 🚀");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsApplying(false);
    }
  };

  const workspacePath = `/collaborate/${project._id}/project`;

  return (
    <Card className="border-brutal hover:shadow-brutal transition-all overflow-hidden flex flex-col h-full bg-card">
      <div className="p-6 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <Badge className="bg-primary text-primary-foreground">OPEN</Badge>
          <div className="flex items-center gap-1 text-xs font-bold bg-muted px-2 py-1 rounded">
            <span>
              <FaUsers />
            </span>
            <span>{project.applicantCount} Applicants</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-head text-xl font-bold mb-3 line-clamp-2">
          {project.projectName}
        </h3>

        {/* Description */}
        {project.description && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
            {project.description}
          </p>
        )}

        {/* Skills */}
        {project.skillsNeeded && project.skillsNeeded.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {project.skillsNeeded.slice(0, 3).map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="text-xs bg-accent/20 border-accent"
              >
                {skill}
              </Badge>
            ))}
            {project.skillsNeeded.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{project.skillsNeeded.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4 py-4 border-t-2 border-black/10 mb-4">
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <FaClock /> Duration
            </p>
            <p className="font-semibold text-sm">
              {project.duration || "Flexible"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <FaUsers /> Access
            </p>
            <p className="font-semibold text-sm">
              {typeof project.maxPositions === "number"
                ? `${project.maxPositions + 1} total seats`
                : "Open to all"}
            </p>
          </div>
        </div>

        {/* Author */}
        <div className="flex items-center gap-2">
          {postedByImageUrl ? (
            <Image
              src={postedByImageUrl}
              alt={project.postedBy.name}
              width={24}
              height={24}
              className="rounded-full border border-black"
            />
          ) : null}
          <div className="text-xs">
            <span className="text-muted-foreground">Posted by </span>
            <span className="font-semibold">{project.postedBy.name}</span>
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="p-6 pt-0">
        {canEnter ? (
          <Link href={workspacePath} className="w-full">
            <Button className="w-full border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all bg-green-500 text-white font-bold flex items-center justify-center gap-2">
              Enter Workspace →
            </Button>
          </Link>
        ) : (
          <Button
            onClick={openApplyDialog}
            disabled={isApplying || hasApplied}
            className="w-full border-brutal shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isApplying ? (
              "Applying..."
            ) : hasApplied ? (
              "Applied ✅"
            ) : (
              <>
                <FaPaperPlane /> Apply to Join →
              </>
            )}
          </Button>
        )}
      </div>

      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent className="border-2 border-black bg-white p-0 shadow-[10px_10px_0_0_rgba(0,0,0,1)] dark:border-[#3A342C] dark:bg-[#111111] dark:shadow-[10px_10px_0_0_rgba(0,0,0,0.6)] sm:max-w-xl">
          <div className="border-b-2 border-black px-6 py-5 dark:border-[#2A2A2A]">
            <DialogHeader className="text-left">
              <DialogTitle className="font-head text-2xl font-bold text-[#181512] dark:text-[#F6F2EA]">
                Apply to Join
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm text-[#6F675C] dark:text-[#B0A89B]">
                Tell the host why you want to join{" "}
                <span className="font-semibold text-[#181512] dark:text-[#F6F2EA]">
                  {project.projectName}
                </span>
                . This is optional, but it helps them review requests faster.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 py-5">
            <label className="mb-2 block text-sm font-bold text-[#181512] dark:text-[#F6F2EA]">
              Why are you a good fit?{" "}
              <span className="text-[#8A8174] dark:text-[#8F887B]">(Optional)</span>
            </label>
            <textarea
              rows={5}
              value={applicationText}
              onChange={(event) => setApplicationText(event.target.value)}
              placeholder="For example: I’m joining tomorrow’s Slot 1 session and I want to work on gameplay, art, or testing."
              className="w-full rounded-xl border-2 border-black bg-[#FCFBF8] px-4 py-3 text-sm text-[#181512] outline-none transition-all placeholder:text-[#9B9287] focus:shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:border-[#3A342C] dark:bg-[#171717] dark:text-[#F6F2EA] dark:placeholder:text-[#7E766B] dark:focus:shadow-[4px_4px_0_0_rgba(0,0,0,0.6)]"
            />
          </div>

          <DialogFooter className="border-t-2 border-black bg-[#FCFBF8] px-6 py-4 dark:border-[#2A2A2A] dark:bg-[#171717] sm:justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                setIsApplyDialogOpen(false);
                setApplicationText("");
              }}
              className="border-2 border-black bg-white text-black dark:border-[#3A342C] dark:bg-[#111111] dark:text-[#F6F2EA]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={isApplying}
              className="border-2 border-black bg-primary text-primary-foreground"
            >
              {isApplying ? "Submitting..." : "Send Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
