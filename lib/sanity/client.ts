import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: true, // Set to false if you need fresh data
  token: process.env.SANITY_API_TOKEN, // Required for write operations
});

// Helper for generating image URLs
const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}

// Helper to get image URL (handles both Sanity images and external URLs)
export function getImageUrl(source: any): string | null {
  if (!source) return null;

  // If it's a string (external URL like Clerk avatar), return directly
  if (typeof source === "string") {
    return source;
  }

  // If it's a Sanity image reference, use urlFor
  if (source._type === "image" || source.asset) {
    return urlFor(source).url();
  }

  return null;
}

// Common query helpers
export const queries = {
  // Get all approved posts
  getAllPosts: `*[_type == "post" && status == "approved"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    thumbnail,
    coverImageUrl,
    tags,
    sparkCount,
    viewCount,
    viewCount,
    isEdited,
    publishedAt,
    "author": author->{name, avatar, tier}
  }`,

  // Get single post by slug
  getPostBySlug: (
    slug: string,
  ) => `*[_type == "post" && slug.current == "${slug}"][0] {
    _id,
    title,
    slug,
    content,
    excerpt,
    thumbnail,
    coverImageUrl,
    tags,
    sparkCount,
    viewCount,
    publishedAt,
    "author": author->{_id, name, avatar, tier, bio, clerkId},
    "comments": comments[] | order(createdAt desc) {
      _key,
      text,
      createdAt,
      sparkCount,
      "user": user->{name, avatar, tier}
    },
    "quest": quest->{title, slug}
  }`,

  // Get active quests (Updated to count participants safely)
  getActiveQuests: `*[_type == "quest" && status in ["open", "active"]] | order(_createdAt desc) {
    _id,
    title,
    slug,
    description,
    status,
    difficulty,
    rewardPoints,
    daysRemaining,
    "proposedBy": proposedBy->{name, avatar, clerkId},
    "participantCount": count(*[_type == "questParticipant" && quest._ref == ^._id])
  }`,

  // Get IDs of quests the user has joined (For O(1) state lookup)
  getUserQuestIds: (clerkId: string) =>
    `*[_type == "questParticipant" && user->clerkId == "${clerkId}"].quest._ref`,

  // Get single quest by slug with detailed participant info
  getQuestBySlug: (
    slug: string,
  ) => `*[_type == "quest" && slug.current == "${slug}"][0] {
    _id,
    title,
    slug,
    description,
    status,
    difficulty,
    rewardPoints,
    daysRemaining,
    "proposedBy": proposedBy->{name, avatar, clerkId},
    "participants": *[_type == "questParticipant" && quest._ref == ^._id] {
      _id,
      joinedAt,
      status,
      "user": user->{name, avatar, clerkId}
    },
    timeline,
    resources
  }`,

  // Get user by Clerk ID
  getUserByClerkId: (
    clerkId: string,
  ) => `*[_type == "user" && clerkId == "${clerkId}"][0] {
    _id,
    name,
    email,
    avatar,
    bio,
    university,
    tier,
    points,
    sparksReceived,
    postsPublished,
    collaborationsCount,
    badges
  }`,

  // Get open collaborations
  getOpenCollaborations: `*[_type == "collaboration" && status == "open"] | order(_createdAt desc) {
    _id,
    projectName,
    description,
    skillsNeeded,
    duration,
    commitment,
    "postedBy": postedBy->{_id, name, avatar, tier, clerkId},
    "teamMembers": teamMembers[]->{_id, clerkId},
    "applicants": applicants[] {
      _key,
      status,
      "user": user->{clerkId}
    },
    "applicantCount": count(applicants)
  }`,

  // Get leaderboard users
  getLeaderboard: `*[_type == "user"] | order(points desc)[0...50] {
    _id,
    name,
    avatar,
    tier,
    points,
    sparksReceived,
    postsPublished,
    collaborationsCount,
    university
  }`,

  // Get single collaboration by ID
  getCollaborationById: (
    id: string,
  ) => `*[_type == "collaboration" && _id == "${id}"][0] {
    _id,
    projectName,
    description,
    skillsNeeded,
    duration,
    commitment,
    status,
    githubRepo,
    designDoc,
    messages[] {
        _key,
        text,
        timestamp,
        "user": user->{name, avatar, clerkId}
    },
    "postedBy": postedBy->{_id, name, avatar, tier, clerkId},
    "teamMembers": teamMembers[]->{_id, name, avatar, tier, university, clerkId},
    "applicants": applicants[] {
        _key,
        status,
        "user": user->{_id, name, avatar, tier, university, clerkId}
    }
  }`,

  // Get upcoming events
  getUpcomingEvents: `*[_type == "event" && startTime > now() && status == "approved"] | order(startTime asc) {
    _id,
    title,
    slug,
    description,
    eventType,
    requirements,
    locationType,
    location,
    startTime,
    endTime,
    registrationLink,
    image,
    "organizer": organizer->{name, avatar}
  }`,
  // Get past events
  getPastEvents: `*[_type == "event" && startTime < now() && status == "approved"] | order(startTime desc) {
    _id,
    title,
    slug,
    description,
    eventType,
    requirements,
    locationType,
    location,
    startTime,
    endTime,
    registrationLink,
    image,
    "organizer": organizer->{name, avatar}
  }`,
};
