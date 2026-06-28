import { NextResponse, NextRequest } from "next/server";

export const dynamic = "force-dynamic";

interface AlgoliaHNHit {
  objectID: string;
  title?: string | null;
  url?: string | null;
  author?: string | null;
  points?: number | null;
  num_comments?: number | null;
  created_at?: string | null;
  created_at_i?: number | null;
  story_text?: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category") || "top";
    const query = searchParams.get("query") || "";
    const page = searchParams.get("page") || "0";

    let url = "";

    if (query) {
      url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(
        query
      )}&tags=story&page=${page}&hitsPerPage=30`;
    } else {
      switch (category) {
        case "new":
          url = `https://hn.algolia.com/api/v1/search_by_date?tags=story&page=${page}&hitsPerPage=30`;
          break;
        case "ask":
          url = `https://hn.algolia.com/api/v1/search?tags=ask_hn&page=${page}&hitsPerPage=30`;
          break;
        case "show":
          url = `https://hn.algolia.com/api/v1/search?tags=show_hn&page=${page}&hitsPerPage=30`;
          break;
        case "top":
        default:
          url = `https://hn.algolia.com/api/v1/search?tags=front_page&page=${page}&hitsPerPage=30`;
          break;
      }
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      next: { revalidate: 120 }, // Cache for 2 minutes
    });

    if (!res.ok) {
      throw new Error(`Algolia HN API responded with status ${res.status}`);
    }

    const data = await res.json();
    const hits: AlgoliaHNHit[] = data.hits || [];

    const normalized = hits
      .filter((hit) => hit && hit.objectID)
      .map((hit) => {
        let domain = "";
        const hitUrl = hit.url;
        if (hitUrl && typeof hitUrl === "string") {
          try {
            const parsed = new URL(hitUrl);
            domain = parsed.hostname.replace("www.", "");
          } catch {
            domain = "";
          }
        }

        const title = hit.title || hit.story_text || "Untitled Story";
        const author = hit.author || "anonymous";
        const points = typeof hit.points === "number" ? hit.points : 0;
        const commentsCount =
          typeof hit.num_comments === "number" ? hit.num_comments : 0;
        const createdAt = hit.created_at || new Date().toISOString();
        const createdAtUnix =
          typeof hit.created_at_i === "number"
            ? hit.created_at_i
            : Math.floor(Date.now() / 1000);

        return {
          id: hit.objectID,
          title,
          url: hitUrl || `https://news.ycombinator.com/item?id=${hit.objectID}`,
          author,
          points,
          commentsCount,
          createdAt,
          createdAtUnix,
          domain,
        };
      });

    // Fetch official OpenGraph images for the first 10 stories in parallel
    // We run this server-side so it's cached together with the HN articles.
    const imagePromises = normalized.slice(0, 10).map(async (story) => {
      if (!story.url || story.url.includes("news.ycombinator.com/item")) {
        return { id: story.id, imageUrl: null };
      }
      try {
        const microlinkRes = await fetch(
          `https://api.microlink.io/?url=${encodeURIComponent(story.url)}`,
          {
            signal: AbortSignal.timeout(1200), // Fast 1.2s timeout so the route stays snappy
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
            next: { revalidate: 3600 },
          }
        );
        if (microlinkRes.ok) {
          const body = await microlinkRes.json();
          const imgUrl =
            body.data?.image?.url || body.data?.logo?.url || null;
          return { id: story.id, imageUrl: imgUrl };
        }
      } catch {
        // Fallback to null on timeout or fetch errors
      }
      return { id: story.id, imageUrl: null };
    });

    const images = await Promise.all(imagePromises);
    const imageMap = new Map(images.map((img) => [img.id, img.imageUrl]));

    const storiesWithImages = normalized.map((story) => ({
      ...story,
      imageUrl: imageMap.get(story.id) || null,
    }));

    return NextResponse.json({
      stories: storiesWithImages,
      nbPages: data.nbPages || 1,
      page: data.page || 0,
      hitsPerPage: data.hitsPerPage || 30,
    });
  } catch (error) {
    console.error("Error in HackerNews proxy API:", error);
    return NextResponse.json(
      { error: "Failed to load news from HackerNews" },
      { status: 500 }
    );
  }
}
