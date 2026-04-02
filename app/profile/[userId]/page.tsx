import { client, urlFor, getImageUrl } from "@/lib/sanity/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";
import { Navigation } from "@/components/layout/Navigation";
import { PostCard } from "@/components/explore/PostCard";
import { Badge } from "@/components/retroui/Badge";
import { Button } from "@/components/retroui/Button";
import ProfileDownloadButton from "@/components/profile/ProfileDownloadButton";
import { ProfileContent } from "@/components/profile/ProfileContent";

import { auth } from "@clerk/nextjs/server";
import { FaGithub, FaLinkedin } from "react-icons/fa6";
import { PenLine, Globe, Zap, Flame, Settings, Trophy } from "lucide-react";

import { getOrCreateUser } from "@/lib/auth/user";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const { userId: loggedInClerkId } = await auth();

  console.log(
    `[Profile Debug] Params ID: ${userId}, LoggedInID: ${loggedInClerkId}`,
  );

  // If viewing own profile by Clerk ID, ensure Sanity user exists
  if (loggedInClerkId && loggedInClerkId === userId) {
    await getOrCreateUser();
  }

  const user = await client.fetch(
    `*[_type == "user" && (_id == $userId || clerkId == $userId)][0] {
      _id,
      name,
      email,
      avatar,
      bio,
      about,
      education,
      university,
      location,
      tier,
      points,
      sparksReceived,
      postsPublished,
      collaborationsCount,
      badges,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      clerkId
    }`,
    { userId },
  );

  if (!user) {
    notFound();
  }

  // Get user's posts
  const posts = await client.fetch(
    `*[_type == "post" && author._ref == $userId && status == "approved"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      thumbnail,
      coverImageUrl,
      tags,
      sparkCount,
      viewCount,
      publishedAt,
      "author": author->{name, avatar, tier}
    }`,
    { userId: user._id },
  );

  // Fetch Collections
  const collections = await client.fetch(
    `*[_type == "collection" && user._ref == $userId] | order(_createdAt desc) {
      _id,
      title,
      description,
      isPrivate,
      "postCount": count(posts),
      posts[]->{
        _id,
        title,
        slug,
        excerpt,
        thumbnail,
        coverImageUrl,
        tags,
        sparkCount,
        viewCount,
        publishedAt,
        "author": author->{name, avatar, tier}
      }
    }`,
    { userId: user._id },
  );

  // Fetch Event Tickets
  const tickets = await client.fetch(
    `*[_type == "eventRegistration" && (user._ref == $userId || clerkId == $clerkId)] | order(registeredAt desc) {
      _id,
      status,
      ticketId,
      registeredAt,
      event->{
        _id,
        title,
        slug,
        startTime,
        location,
        locationType,
        image
      }
    }`,
    { userId: user._id, clerkId: user.clerkId },
  );

  // Fetch Organized Events
  const organizedEvents = await client.fetch(
    `*[_type == "event" && organizer._ref == $userId] | order(startTime desc) {
      _id,
      title,
      slug,
      description,
      startTime,
      endTime,
      location,
      locationType,
      status,
      image
    }`,
    { userId: user._id },
  );

  const isOwnProfile =
    loggedInClerkId &&
    (loggedInClerkId === userId || loggedInClerkId === user.clerkId);

  const tierNames = [
    "",
    "Spark Initiate",
    "Idea Igniter",
    "Forge Master",
    "RnD Fellow",
  ];
  
  const getTierIcon = (tier: number) => {
    switch (tier) {
      case 1: return <Zap className="w-5 h-5 inline text-yellow-500" />;
      case 2: return <Flame className="w-5 h-5 inline text-orange-500" />;
      case 3: return <Settings className="w-5 h-5 inline text-slate-500" />;
      case 4: return <Trophy className="w-5 h-5 inline text-yellow-600" />;
      default: return null;
    }
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          {/* Profile Header */}
          <div className="relative border-2 border-brutal p-8 bg-card mb-12 rounded-xl overflow-hidden shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm transition-all duration-300 group">
            {/* Tech Pattern Background */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                backgroundSize: "24px 24px",
              }}
            />

            <div className="flex flex-col md:flex-row gap-8 relative items-start z-10">
              {/* Avatar */}
              {user.avatar && (
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-br from-primary to-purple-600 rounded-full blur opacity-30 group-hover:opacity-60 transition-opacity" />
                  <Image
                    src={
                      typeof user.avatar === "string"
                        ? user.avatar
                        : getImageUrl(user.avatar) || ""
                    }
                    alt={user.name}
                    width={140}
                    height={140}
                    className="relative rounded-full border-4 border-brutal object-cover shadow-sm bg-background"
                  />
                  <div className="absolute bottom-0 right-0 bg-background rounded-full p-2 border-2 border-brutal shadow-sm">
                    {getTierIcon(user.tier)}
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="flex-1 w-full">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                  <div>
                    <h1 className="font-head text-4xl md:text-5xl font-black mb-3 tracking-tight text-foreground">
                      {user.name}
                    </h1>
                    <Badge className="bg-primary text-primary-foreground text-sm py-1 px-3 border-2 border-brutal shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-black">
                      Tier {user.tier}: {tierNames[user.tier]}
                    </Badge>
                  </div>

                  {/* Edit & Download Buttons */}
                  <div className="flex gap-3">
                    <ProfileDownloadButton user={user} posts={posts} />

                    {isOwnProfile && (
                      <Link href="/onboarding">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-10 w-10 border-2 border-brutal hover:bg-muted transition-all rounded-full"
                          title="Edit Profile"
                        >
                          <PenLine className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                {user.bio && (
                  <p className="text-xl md:text-2xl font-medium mb-6 text-muted-foreground leading-relaxed max-w-3xl">
                    {user.bio}
                  </p>
                )}

                {/* Tech Specs (Meta) */}
                <div className="flex flex-wrap gap-3 text-sm font-mono mb-8">
                  {user.university && (
                    <span className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-md border border-brutal/50 text-muted-foreground">
                      <span className="opacity-70">UNI:</span>
                      <span className="font-bold text-foreground">
                        {user.university}
                      </span>
                    </span>
                  )}
                  {user.education && (
                    <span className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-md border border-brutal/50 text-muted-foreground">
                      <span className="opacity-70">DEG:</span>
                      <span className="font-bold text-foreground">
                        {user.education}
                      </span>
                    </span>
                  )}
                  {user.location && (
                    <span className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-md border border-brutal/50 text-muted-foreground">
                      <span className="opacity-70">LOC:</span>
                      <span className="font-bold text-foreground">
                        {user.location}
                      </span>
                    </span>
                  )}
                </div>

                {/* About Me */}
                {user.about && (
                  <div className="mb-8 p-6 bg-muted/20 border-l-4 border-primary rounded-r-xl">
                    <h3 className="font-mono text-xs font-bold text-primary mb-2 uppercase tracking-wider flex items-center gap-2">
                      // About_Me.md
                    </h3>
                    <p className="text-muted-foreground whitespace-pre-wrap font-body leading-relaxed max-w-4xl">
                      {user.about}
                    </p>
                  </div>
                )}

                {/* Social Links */}
                <div className="flex gap-4">
                  {user.githubUrl && (
                    <a
                      href={user.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full border-2 border-brutal hover:scale-110 hover:-rotate-6 transition-transform bg-card shadow-sm group/icon"
                      >
                        <FaGithub className="text-xl group-hover/icon:scale-110 transition-transform" />
                      </Button>
                    </a>
                  )}
                  {user.linkedinUrl && (
                    <a
                      href={user.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full border-2 border-brutal hover:scale-110 hover:rotate-6 transition-transform bg-card shadow-sm group/icon"
                      >
                        <FaLinkedin className="text-xl group-hover/icon:scale-110 transition-transform text-blue-600" />
                      </Button>
                    </a>
                  )}
                  {user.portfolioUrl && (
                    <a
                      href={user.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full border-2 border-brutal hover:scale-110 hover:-rotate-6 transition-transform bg-card shadow-sm group/icon"
                      >
                        <Globe className="text-xl group-hover/icon:scale-110 transition-transform text-green-500" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {/* Total Points - Featured */}
            <div className="relative overflow-hidden border-2 border-brutal p-6 bg-card text-center rounded-xl shadow-brutal hover:-translate-y-1 hover:shadow-brutal-lg transition-all duration-300 group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-orange-500" />
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <p className="text-5xl font-head font-black text-primary mb-2 tracking-tighter group-hover:scale-110 transition-transform duration-300 inline-block">
                {user.points}
              </p>
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Total Points
              </p>
            </div>

            <div className="border-2 border-brutal p-6 bg-card text-center rounded-xl shadow-brutal hover:-translate-y-1 hover:shadow-brutal-lg transition-all duration-300 group">
              <p className="text-4xl font-head font-bold mb-2 group-hover:text-foreground transition-colors">
                {posts.length}
              </p>
              <p className="text-xs font-mono text-muted-foreground uppercase">
                Posts Published
              </p>
            </div>

            <div className="border-2 border-brutal p-6 bg-card text-center rounded-xl shadow-brutal hover:-translate-y-1 hover:shadow-brutal-lg transition-all duration-300 group">
              <p className="text-4xl font-head font-bold mb-2 group-hover:text-yellow-500 transition-colors">
                {user.sparksReceived}
              </p>
              <p className="text-xs font-mono text-muted-foreground uppercase">
                Sparks Received
              </p>
            </div>

            <div className="border-2 border-brutal p-6 bg-card text-center rounded-xl shadow-brutal hover:-translate-y-1 hover:shadow-brutal-lg transition-all duration-300 group">
              <p className="text-4xl font-head font-bold mb-2 group-hover:text-blue-500 transition-colors">
                {user.collaborationsCount}
              </p>
              <p className="text-xs font-mono text-muted-foreground uppercase">
                Collaborations
              </p>
            </div>
          </div>

          {/* Profile Content (Tabs) */}
          <ProfileContent
            user={user}
            posts={posts}
            collections={collections}
            tickets={tickets}
            organizedEvents={organizedEvents}
            isOwnProfile={!!isOwnProfile}
          />
        </div>
      </main>
    </>
  );
}
