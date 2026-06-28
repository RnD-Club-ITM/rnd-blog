"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/retroui/Button";
import {
  Search,
  RefreshCw,
  MessageSquare,
  Heart,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  User,
  Flame,
  Sparkles,
  HelpCircle,
  Eye,
  Globe,
  AlertTriangle,
  Newspaper,
} from "lucide-react";

interface HNStory {
  id: string;
  title: string;
  url: string;
  author: string;
  points: number;
  commentsCount: number;
  createdAt: string;
  createdAtUnix: number;
  domain: string;
  imageUrl?: string | null;
}

function formatTimeAgo(timestampUnix: number): string {
  const diffSec = Math.floor(Date.now() / 1000 - timestampUnix);
  if (diffSec < 0) return "just now";
  if (diffSec < 60) return "just now";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

function BentoSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 grid-flow-row-dense gap-6 animate-pulse">
      {Array.from({ length: 9 }).map((_, idx) => {
        const pattern = idx % 6;
        let span = "md:col-span-1 md:row-span-1 h-[200px]";
        if (pattern === 0) span = "md:col-span-2 md:row-span-2 h-[420px]";
        if (pattern === 1) span = "md:col-span-1 md:row-span-2 h-[420px]";
        if (pattern === 5) span = "md:col-span-2 md:row-span-1 h-[200px]";

        return (
          <div
            key={idx}
            className={`${span} bg-card border-2 border-black rounded-3xl p-6 flex flex-col justify-between shadow-[4px_4px_0_0_rgba(0,0,0,1)]`}
          >
            <div className="space-y-4">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4"></div>
              <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6"></div>
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
            </div>
            <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3"></div>
          </div>
        );
      })}
    </div>
  );
}

export default function NewsPage() {
  const [stories, setStories] = useState<HNStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState<"top" | "new" | "ask" | "show">("top");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed for HN API
  const [totalPages, setTotalPages] = useState(1);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const qParam = searchQuery ? `&query=${encodeURIComponent(searchQuery)}` : "";
      const res = await fetch(`/api/news?category=${category}&page=${currentPage}${qParam}`);
      if (!res.ok) throw new Error("Failed to fetch HackerNews articles");
      const data = await res.json();
      setStories(data.stories || []);
      setTotalPages(data.nbPages || 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [category, currentPage, searchQuery]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Reset pagination on category change
  const handleCategoryChange = (cat: typeof category) => {
    setCategory(cat);
    setCurrentPage(0);
    setSearchQuery("");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchNews();
  };

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage((prev) => prev + 1);
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pb-16">
        {/* Banner Section */}
        <section className="border-b-4 border-black bg-primary/10 py-12 mb-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="mb-4 inline-flex items-center rounded-full border-2 border-black bg-card px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              ⚡ Spark News Hub
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="font-head text-4xl lg:text-6xl font-bold mb-4">
                  Tech{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                    News
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl">
                  Stay updated with trending technology updates, engineering insights, and tech community discussions.
                </p>
              </div>
              <div>
                <Button
                  onClick={fetchNews}
                  disabled={loading}
                  className="bg-card hover:bg-muted text-foreground border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-sm tracking-wider uppercase flex items-center gap-2 h-14 px-6 shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh News
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Switching & Search Controls */}
        <section className="container mx-auto px-4 max-w-6xl mb-8">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Category tabs */}
            <div className="inline-flex p-1 border-4 border-black bg-card rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-max shrink-0">
              {(["top", "new", "ask", "show"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-4 py-2 rounded-xl font-head text-xs font-bold transition-all uppercase tracking-widest ${
                    category === cat
                      ? "bg-primary text-primary-foreground border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat === "top" ? (
                    <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5" /> Top</span>
                  ) : cat === "new" ? (
                    <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> New</span>
                  ) : cat === "ask" ? (
                    <span className="flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5" /> Ask</span>
                  ) : (
                    <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Show</span>
                  )}
                </button>
              ))}
            </div>

            {/* Search Input bar */}
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Full-text search stories..."
                  className="h-12 w-full rounded-2xl border-2 border-black dark:border-zinc-800 bg-background pl-10 pr-4 text-sm font-medium outline-none focus:border-primary placeholder:text-muted-foreground"
                />
              </div>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] font-bold text-xs uppercase px-4 h-12"
              >
                Search
              </Button>
            </form>
          </div>
        </section>

        {/* Error Notification */}
        {error && (
          <section className="container mx-auto px-4 max-w-6xl mb-8">
            <div className="bg-red-100 border-2 border-red-500 text-red-800 px-6 py-4 rounded-2xl font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{error}. Please try again later.</span>
            </div>
          </section>
        )}

        {/* Bento Grid News */}
        <section className="container mx-auto px-4 max-w-6xl">
          {loading ? (
            <BentoSkeleton />
          ) : stories.length > 0 ? (
            <div>
              {/* Asymmetric Bento Grid Flow */}
              <div className="grid grid-cols-1 md:grid-cols-3 grid-flow-row-dense gap-6">
                {stories.map((s, idx) => {
                  const rank = idx + 1 + currentPage * 30;
                  const pattern = idx % 6;
                  
                  let cardClass = "";
                  let isHero = false;
                  let isTall = false;
                  let isWide = false;

                  if (pattern === 0) {
                    // Large wide 2-col hero card
                    cardClass = "md:col-span-2 md:row-span-2 min-h-[380px] bg-gradient-to-br from-orange-400/20 to-red-500/20 border-4";
                    isHero = true;
                  } else if (pattern === 1) {
                    // Tall vertical card
                    cardClass = "md:col-span-1 md:row-span-2 min-h-[380px] bg-gradient-to-br from-purple-400/10 to-indigo-500/10 border-4";
                    isTall = true;
                  } else if (pattern === 5) {
                    // Wide horizontal card
                    cardClass = "md:col-span-2 md:row-span-1 min-h-[190px] bg-gradient-to-br from-emerald-400/10 to-teal-500/10 border-4";
                    isWide = true;
                  } else {
                    // Standard card
                    cardClass = "md:col-span-1 md:row-span-1 min-h-[190px] bg-card border-2";
                  }

                  return (
                    <div
                      key={s.id}
                      className={`${cardClass} border-black dark:border-border rounded-3xl p-6 flex flex-col justify-between shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all group relative overflow-hidden`}
                    >
                      {s.imageUrl && (
                        <div className="absolute inset-0 z-0 transition-transform duration-500 group-hover:scale-105 pointer-events-none">
                          <img
                            src={s.imageUrl}
                            alt={s.title}
                            className="w-full h-full object-cover opacity-20 dark:opacity-10 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-30 dark:group-hover:opacity-20 transition-all duration-300"
                            onError={(e) => {
                              const parent = (e.target as HTMLElement).parentElement;
                              if (parent) parent.style.display = "none";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-card/60 dark:from-zinc-950/60 via-transparent to-transparent" />
                        </div>
                      )}

                      {/* Top section: Badges & Domain */}
                      <div className="w-full shrink-0 z-10 relative">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border-2 border-black rounded shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${
                            isHero 
                              ? "bg-orange-400 text-black" 
                              : isTall 
                                ? "bg-purple-400 text-white" 
                                : isWide 
                                  ? "bg-emerald-400 text-black" 
                                  : "bg-secondary text-secondary-foreground"
                          }`}>
                            {isHero ? (
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> Hero #{rank}
                              </span>
                            ) : (
                              `Rank #${rank}`
                            )}
                          </span>
                          {s.domain && (
                            <span className="text-[10px] font-black text-muted-foreground truncate max-w-[140px] uppercase tracking-wider flex items-center gap-1">
                              <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              <span>{s.domain}</span>
                            </span>
                          )}
                        </div>

                        {/* Title link */}
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-start gap-1 group/title"
                        >
                          <h2 className={`font-head font-black text-foreground group-hover/title:text-primary transition-colors leading-tight ${
                            isHero 
                              ? "text-xl md:text-2xl line-clamp-4" 
                              : isTall 
                                ? "text-lg line-clamp-6" 
                                : "text-sm md:text-base line-clamp-3"
                          }`}>
                            {s.title}
                          </h2>
                          <ExternalLink className="w-4 h-4 text-neutral-400 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      </div>

                      {/* Bottom section: Metadata row */}
                      <div className={`w-full pt-3 mt-4 border-t border-black/10 dark:border-zinc-800 flex ${
                        isTall ? "flex-col gap-2 items-start" : "flex-row items-center justify-between gap-4"
                      } shrink-0 z-10 relative`}>
                        {/* Vote & Comment metrics */}
                        <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 rounded border border-red-200 dark:border-red-900">
                            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500/10 shrink-0" />
                            {s.points}
                          </span>
                          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-900">
                            <MessageSquare className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10 shrink-0" />
                            {s.commentsCount}
                          </span>
                        </div>

                        {/* Author profile & timestamp */}
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>{formatTimeAgo(s.createdAtUnix)}</span>
                          <span>•</span>
                          <a
                            href={`https://news.ycombinator.com/user?id=${s.author}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline hover:text-foreground flex items-center gap-0.5 shrink-0"
                          >
                            <User className="w-3 h-3" /> @{s.author}
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-6 mt-12">
                  <Button
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                    className="bg-card hover:bg-muted text-foreground border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] font-bold text-xs uppercase px-4 h-11 flex items-center gap-1 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </Button>
                  <span className="font-head font-bold text-sm tracking-widest uppercase">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <Button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages - 1}
                    className="bg-card hover:bg-muted text-foreground border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] font-bold text-xs uppercase px-4 h-11 flex items-center gap-1 disabled:opacity-50"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-card border-2 border-dashed border-border rounded-3xl">
              <Newspaper className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-head text-2xl font-bold mb-2">No news stories found</h3>
              <p className="text-muted-foreground mb-6">Try searching for other terms or resetting search!</p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setCategory("top");
                  setCurrentPage(0);
                }}
                className="bg-primary text-primary-foreground border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all font-bold px-6"
              >
                Reset Feed
              </Button>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
