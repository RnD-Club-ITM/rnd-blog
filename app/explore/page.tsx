import { client, queries } from "@/lib/sanity/client";
import { Navigation } from "@/components/layout/Navigation";
import { PostCard } from "@/components/explore/PostCard";
import { FilterBar } from "@/components/explore/FilterBar";
import { getOrCreateUser } from "@/lib/auth/user"; // Import user helper
import { redirect } from "next/navigation";

// Force dynamic rendering to ensure searchParams work correctly
export const dynamic = "force-dynamic";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; search?: string }>;
}) {
  const { tag, search } = await searchParams;

  // Build query with filters - keep all conditions inside the brackets
  let filters = `_type == "post" && status == "approved"`;

  if (tag) {
    // Case-insensitive tag matching
    filters += ` && defined(tags) && count(tags[lower(@) == lower($tag)]) > 0`;
  }

  if (search) {
    filters += ` && (title match $search || excerpt match $search)`;
  }

  const query = `*[${filters}] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    thumbnail,
    coverImageUrl,
    videoThumbnail,
    tags,
    "sparkCount": coalesce(sparkCount, 0),
    viewCount,
    publishedAt,
    "author": author->{name, avatar, tier}
  }`;

  // Fetch with fresh data (bypass CDN/Cache for search)
  const queryParams: Record<string, string> = {};
  if (tag) queryParams.tag = tag;
  if (search) queryParams.search = `*${search}*`;

  const posts = await client.fetch(query, queryParams, {
    cache: "no-store",
    next: { revalidate: 0 },
  });

  // Fetch user's bookmarked posts if logged in
  let bookmarkedPostIds = new Set<string>();
  const { userId } = await import("@clerk/nextjs/server").then((mod) =>
    mod.auth(),
  );

  if (userId) {
    const userQuery = `*[_type == "user" && clerkId == "${userId}"][0]._id`;
    const sanityUserId = await client.fetch(userQuery);

    if (sanityUserId) {
      const bookmarks = await client.fetch(
        `*[_type == "collection" && user._ref == $userId].posts[]._ref`,
        { userId: sanityUserId },
      );
      // Flatten and store in Set for O(1) lookup
      bookmarks.forEach((id: string) => bookmarkedPostIds.add(id));
    }
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="border-b-4 border-black bg-primary/10 py-8 sm:py-12">
          <div className="container mx-auto px-4">
            <h1 className="font-head text-3xl sm:text-4xl lg:text-6xl font-bold mb-3 sm:mb-4">
              Explore{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                Research
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
              Discover peer-curated engineering projects, research, and
              innovations from students around the world.
            </p>
          </div>
        </section>

        {/* Filters */}
        <FilterBar currentTag={tag} currentSearch={search} />

        {/* Posts Grid */}
        <section className="container mx-auto px-4 py-12">
          {!posts || posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="font-head text-2xl font-bold mb-2">
                No posts found
              </h2>
              <p className="text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post: any) => (
                <PostCard
                  key={post._id}
                  post={{
                    ...post,
                    isBookmarked: bookmarkedPostIds.has(post._id),
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
