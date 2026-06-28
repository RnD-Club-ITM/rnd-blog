"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/retroui/Button";
import {
  Calendar,
  MapPin,
  Award,
  Search,
  RefreshCw,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Star,
  AlertCircle,
  DollarSign,
  Trophy,
  Laptop,
  Globe,
} from "lucide-react";

interface HackathonItem {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  organizationName: string;
  location: string;
  isOnline: boolean;
  timeLeft: string;
  dates: string;
  prizeAmount: string;
  prizeVal: number;
  registrationsCount: number;
  featured: boolean;
  themes: string[];
  isUrgent: boolean;
  country: string;
  state: string;
  city: string;
}

const THEME_PILLS = [
  "AI/ML",
  "Web",
  "Mobile",
  "Databases",
  "Gaming",
  "Beginner",
  "Enterprise",
  "Arts",
  "Open Ended",
];

// Helper to parse deadline string into estimated remaining days for sorting
function parseDaysLeft(timeLeft: string): number {
  const str = timeLeft.toLowerCase();
  if (str.includes("ended") || str.includes("closed")) return 99999;
  if (str.includes("hour") || str.includes("minute")) return 0.5;

  const dayMatch = str.match(/(\d+)\s+days?/);
  if (dayMatch) return parseInt(dayMatch[1], 10);

  const weekMatch = str.match(/(\d+)\s+weeks?/);
  if (weekMatch) return parseInt(weekMatch[1], 10) * 7;

  const monthMatch = str.match(/(\d+)\s+months?/);
  if (monthMatch) return parseInt(monthMatch[1], 10) * 30;

  if (str.includes("month")) return 30;
  if (str.includes("week")) return 7;
  if (str.includes("day")) return 1;

  return 9999;
}

// Helper to check theme categories
function matchesTheme(themes: string[], category: string): boolean {
  if (category === "all") return true;
  const lowerThemes = themes.map((t) => t.toLowerCase());
  const cat = category.toLowerCase();

  switch (cat) {
    case "ai/ml":
      return lowerThemes.some(
        (t) =>
          t.includes("ai") ||
          t.includes("machine learning") ||
          t.includes("neural") ||
          t.includes("deep learning") ||
          t.includes("intelligence")
      );
    case "web":
      return lowerThemes.some(
        (t) => t.includes("web") || t.includes("frontend") || t.includes("backend")
      );
    case "mobile":
      return lowerThemes.some(
        (t) => t.includes("mobile") || t.includes("ios") || t.includes("android")
      );
    case "databases":
      return lowerThemes.some(
        (t) => t.includes("database") || t.includes("sql") || t.includes("data")
      );
    case "gaming":
      return lowerThemes.some(
        (t) =>
          t.includes("game") || t.includes("gaming") || t.includes("ar") || t.includes("vr")
      );
    case "beginner":
      return lowerThemes.some(
        (t) => t.includes("beginner") || t.includes("education") || t.includes("student")
      );
    case "enterprise":
      return lowerThemes.some(
        (t) =>
          t.includes("enterprise") ||
          t.includes("business") ||
          t.includes("fintech") ||
          t.includes("productivity")
      );
    case "arts":
      return lowerThemes.some(
        (t) => t.includes("art") || t.includes("music") || t.includes("design") || t.includes("creative")
      );
    case "open ended":
      return lowerThemes.some(
        (t) => t.includes("open ended") || t.includes("general") || t.includes("social good")
      );
    default:
      return lowerThemes.some((t) => t.includes(cat));
  }
}

function SkeletonCard() {
  return (
    <div className="bg-card border-2 border-black dark:border-border rounded-3xl p-6 h-[440px] flex flex-col justify-between animate-pulse shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
      <div className="space-y-4">
        <div className="h-40 bg-zinc-200 dark:bg-zinc-800 rounded-2xl w-full"></div>
        <div className="flex gap-2">
          <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded-full w-16"></div>
          <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded-full w-20"></div>
        </div>
        <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3"></div>
        </div>
      </div>
      <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-full mt-4"></div>
    </div>
  );
}

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<HackathonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState<"all" | "online" | "inperson">("all");
  const [selectedTheme, setSelectedTheme] = useState("all");
  const [selectedSort, setSelectedSort] = useState<"newest" | "deadline" | "prize" | "popularity">("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // Cascading Location Filters
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");

  const itemsPerPage = 9;

  const fetchHackathons = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/hackathons");
      if (!res.ok) throw new Error("Failed to fetch hackathons");
      const data = await res.json();
      setHackathons(data.hackathons || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHackathons();
  }, [fetchHackathons]);

  // Handle format change
  const handleLocationChange = (val: "all" | "online" | "inperson") => {
    setLocationFilter(val);
    setSelectedCountry("all");
    setSelectedState("all");
    setSelectedCity("all");
    setCurrentPage(1);
  };

  const handleThemeChange = (theme: string) => {
    setSelectedTheme((prev) => (prev === theme ? "all" : theme));
    setCurrentPage(1);
  };

  // 1. Dynamic Unique Countries list
  const availableCountries = useMemo(() => {
    const countriesSet = new Set<string>();
    hackathons.forEach((h) => {
      if (h.country && h.country !== "Online") {
        countriesSet.add(h.country);
      }
    });
    return Array.from(countriesSet).sort();
  }, [hackathons]);

  // 2. Dynamic Unique States inside selected Country
  const availableStates = useMemo(() => {
    if (selectedCountry === "all") return [];
    const statesSet = new Set<string>();
    hackathons.forEach((h) => {
      if (h.country === selectedCountry && h.state && h.state !== "Online") {
        statesSet.add(h.state);
      }
    });
    return Array.from(statesSet).sort();
  }, [hackathons, selectedCountry]);

  // 3. Dynamic Unique Cities inside selected State & Country
  const availableCities = useMemo(() => {
    if (selectedCountry === "all" || selectedState === "all") return [];
    const citiesSet = new Set<string>();
    hackathons.forEach((h) => {
      if (
        h.country === selectedCountry &&
        h.state === selectedState &&
        h.city &&
        h.city !== "Online"
      ) {
        citiesSet.add(h.city);
      }
    });
    return Array.from(citiesSet).sort();
  }, [hackathons, selectedCountry, selectedState]);

  // Filter & Sort Hackathons
  const processedHackathons = useMemo(() => {
    let result = [...hackathons];

    // 1. Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (h) =>
          h.title.toLowerCase().includes(query) ||
          h.organizationName.toLowerCase().includes(query) ||
          h.themes.some((t) => t.toLowerCase().includes(query))
      );
    }

    // 2. Location format
    if (locationFilter === "online") {
      result = result.filter((h) => h.isOnline);
    } else if (locationFilter === "inperson") {
      result = result.filter((h) => !h.isOnline);
    }

    // 3. Cascading geographic filters (only apply if not filtered by 'online')
    if (locationFilter !== "online") {
      if (selectedCountry !== "all") {
        result = result.filter((h) => h.country === selectedCountry);
      }
      if (selectedState !== "all") {
        result = result.filter((h) => h.state === selectedState);
      }
      if (selectedCity !== "all") {
        result = result.filter((h) => h.city === selectedCity);
      }
    }

    // 4. Themes
    if (selectedTheme !== "all") {
      result = result.filter((h) => matchesTheme(h.themes, selectedTheme));
    }

    // 5. Sort
    result.sort((a, b) => {
      switch (selectedSort) {
        case "deadline":
          return parseDaysLeft(a.timeLeft) - parseDaysLeft(b.timeLeft);
        case "prize":
          return b.prizeVal - a.prizeVal;
        case "popularity":
          return b.registrationsCount - a.registrationsCount;
        case "newest":
        default:
          // Parse IDs as numbers if possible, fallback to standard sort
          const aIdNum = parseInt((a.id || "").replace(/[^0-9]/g, ""), 10) || 0;
          const bIdNum = parseInt((b.id || "").replace(/[^0-9]/g, ""), 10) || 0;
          return bIdNum - aIdNum;
      }
    });

    return result;
  }, [
    hackathons,
    searchQuery,
    locationFilter,
    selectedCountry,
    selectedState,
    selectedCity,
    selectedTheme,
    selectedSort,
  ]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(processedHackathons.length / itemsPerPage));
  const paginatedHackathons = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return processedHackathons.slice(startIdx, startIdx + itemsPerPage);
  }, [processedHackathons, currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pb-16">
        {/* Banner Section */}
        <section className="border-b-4 border-black bg-primary/10 py-12 mb-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="mb-4 inline-flex items-center rounded-full border-2 border-black bg-card px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              Spark Hackathons Hub
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="font-head text-4xl lg:text-6xl font-bold mb-4">
                  Explore{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                    Hackathons
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl">
                  Explore upcoming global hackathons with advanced sorting and nested geographic filters.
                </p>
              </div>
              <div>
                <Button
                  onClick={fetchHackathons}
                  disabled={loading}
                  className="bg-card hover:bg-muted text-foreground border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-sm tracking-wider uppercase flex items-center gap-2 h-14 px-6 shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh Feed
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Panel */}
        <section className="container mx-auto px-4 max-w-6xl mb-8">
          <div className="border-4 border-black dark:border-border bg-card p-6 rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by title, organizer, themes..."
                  className="h-14 w-full rounded-2xl border-2 border-black dark:border-zinc-800 bg-background pl-12 pr-4 text-base font-medium outline-none transition-colors focus:border-primary placeholder:text-muted-foreground"
                />
              </div>

              {/* Sort Selector */}
              <div className="relative min-w-[180px] flex-1 sm:flex-none">
                <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
                <select
                  value={selectedSort}
                  onChange={(e) => {
                    setSelectedSort(e.target.value as "newest" | "deadline" | "prize" | "popularity");
                    setCurrentPage(1);
                  }}
                  className="h-14 w-full rounded-2xl border-2 border-black dark:border-zinc-800 bg-background pl-10 pr-8 text-sm font-bold uppercase tracking-wider outline-none appearance-none focus:border-primary cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="deadline">Soonest Deadline</option>
                  <option value="prize">Prize Pool</option>
                  <option value="popularity">Most Popular</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground font-bold">
                  ▼
                </div>
              </div>

              {/* Location Selector */}
              <div className="flex border-2 border-black dark:border-zinc-800 rounded-2xl overflow-hidden bg-background h-14 shrink-0">
                <button
                  onClick={() => handleLocationChange("all")}
                  className={`px-4 text-xs font-bold uppercase tracking-wider transition-colors ${
                    locationFilter === "all"
                      ? "bg-primary text-primary-foreground border-r-2 border-black dark:border-zinc-800"
                      : "text-muted-foreground hover:bg-muted border-r-2 border-black dark:border-zinc-800"
                  }`}
                >
                  <span className="flex items-center gap-1.5 justify-center"><Globe className="w-3.5 h-3.5" /> All Format</span>
                </button>
                <button
                  onClick={() => handleLocationChange("online")}
                  className={`px-4 text-xs font-bold uppercase tracking-wider transition-colors ${
                    locationFilter === "online"
                      ? "bg-primary text-primary-foreground border-r-2 border-black dark:border-zinc-800"
                      : "text-muted-foreground hover:bg-muted border-r-2 border-black dark:border-zinc-800"
                  }`}
                >
                  <span className="flex items-center gap-1.5 justify-center"><Laptop className="w-3.5 h-3.5" /> Online</span>
                </button>
                <button
                  onClick={() => handleLocationChange("inperson")}
                  className={`px-4 text-xs font-bold uppercase tracking-wider transition-colors ${
                    locationFilter === "inperson" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span className="flex items-center gap-1.5 justify-center"><MapPin className="w-3.5 h-3.5" /> In-Person</span>
                </button>
              </div>
            </div>

            {/* Nested Geographic Filters */}
            {locationFilter !== "online" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-dashed border-border">
                {/* Country Filter */}
                <div className="relative">
                  <span className="block text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-1">
                    Country Filter
                  </span>
                  <select
                    value={selectedCountry}
                    onChange={(e) => {
                      setSelectedCountry(e.target.value);
                      setSelectedState("all");
                      setSelectedCity("all");
                      setCurrentPage(1);
                    }}
                    className="h-12 w-full rounded-xl border-2 border-black dark:border-zinc-800 bg-background px-4 text-xs font-bold uppercase tracking-wider outline-none appearance-none focus:border-primary cursor-pointer"
                  >
                    <option value="all">All Countries</option>
                    {availableCountries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 bottom-3 pointer-events-none text-muted-foreground text-xs font-bold">
                    ▼
                  </div>
                </div>

                {/* State Filter */}
                <div className="relative">
                  <span className="block text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-1">
                    State Filter
                  </span>
                  <select
                    value={selectedState}
                    disabled={selectedCountry === "all" || availableStates.length === 0}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setSelectedCity("all");
                      setCurrentPage(1);
                    }}
                    className="h-12 w-full rounded-xl border-2 border-black dark:border-zinc-800 bg-background px-4 text-xs font-bold uppercase tracking-wider outline-none appearance-none focus:border-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="all">All States</option>
                    {availableStates.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 bottom-3 pointer-events-none text-muted-foreground text-xs font-bold">
                    ▼
                  </div>
                </div>

                {/* City Filter */}
                <div className="relative">
                  <span className="block text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-1">
                    City Filter
                  </span>
                  <select
                    value={selectedCity}
                    disabled={selectedState === "all" || availableCities.length === 0}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-12 w-full rounded-xl border-2 border-black dark:border-zinc-800 bg-background px-4 text-xs font-bold uppercase tracking-wider outline-none appearance-none focus:border-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="all">All Cities</option>
                    {availableCities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 bottom-3 pointer-events-none text-muted-foreground text-xs font-bold">
                    ▼
                  </div>
                </div>
              </div>
            )}

            {/* Theme Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-dashed border-border">
              <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider mr-2">
                Themes:
              </span>
              <button
                onClick={() => handleThemeChange("all")}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-2 border-black rounded-lg transition-all ${
                  selectedTheme === "all"
                    ? "bg-primary text-primary-foreground shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                    : "bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                All Themes
              </button>
              {THEME_PILLS.map((theme) => (
                <button
                  key={theme}
                  onClick={() => handleThemeChange(theme)}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-2 border-black rounded-lg transition-all ${
                    selectedTheme === theme
                      ? "bg-primary text-primary-foreground shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                      : "bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Error Notification */}
        {error && (
          <section className="container mx-auto px-4 max-w-6xl mb-8">
            <div className="bg-red-100 border-2 border-red-500 text-red-800 px-6 py-4 rounded-2xl font-semibold">
              ⚠️ {error}. Please try again later.
            </div>
          </section>
        )}

        {/* Hackathon Cards Grid */}
        <section className="container mx-auto px-4 max-w-6xl">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 9 }).map((_, idx) => (
                <SkeletonCard key={idx} />
              ))}
            </div>
          ) : processedHackathons.length > 0 ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedHackathons.map((h) => (
                  <div
                    key={h.id}
                    className="bg-card text-card-foreground border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:border-border dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all rounded-3xl overflow-hidden flex flex-col h-[440px] group relative"
                  >
                    {/* Thumbnail Image */}
                    <div className="h-40 bg-muted border-b-2 border-black dark:border-border overflow-hidden relative shrink-0">
                      <img
                        src={h.thumbnailUrl}
                        alt={h.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&auto=format&fit=crop&q=80";
                        }}
                      />

                      {/* Featured & Urgent Badges */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                        {h.featured && (
                          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-black border-2 border-black rounded shadow-[2px_2px_0_0_rgba(0,0,0,1)] flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-black shrink-0" /> Featured
                          </span>
                        )}
                        {h.isUrgent && (
                          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-red-500 text-white border-2 border-black rounded shadow-[2px_2px_0_0_rgba(0,0,0,1)] flex items-center gap-1 animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Urgent
                          </span>
                        )}
                      </div>

                      {/* Prize Pool Badge Overlay */}
                      <div className="absolute bottom-3 right-3 bg-card border-2 border-black px-2.5 py-1 rounded-md font-bold text-xs shadow-[2px_2px_0_0_rgba(0,0,0,1)] max-w-[150px] truncate flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 shrink-0 text-emerald-500" /> {h.prizeAmount}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 flex-1 flex flex-col justify-between overflow-hidden">
                      <div className="overflow-hidden">
                        {/* Org Name */}
                        <p className="text-xs font-bold text-primary uppercase tracking-wider truncate mb-1">
                          {h.organizationName}
                        </p>

                        {/* Title */}
                        <h3 className="font-head text-lg font-black group-hover:text-primary transition-colors line-clamp-2 leading-tight mb-3">
                          {h.title}
                        </h3>

                        {/* Event Details */}
                        <div className="space-y-1.5 text-xs text-muted-foreground font-semibold">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                            <span className="truncate">{h.timeLeft}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-green-500 shrink-0" />
                            <span className="truncate">{h.dates}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate">
                              {h.isOnline ? "Online" : h.location}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            <span>
                              {h.id.startsWith("hackclub")
                                ? "Community event"
                                : `${h.registrationsCount.toLocaleString()} registered`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer: Theme Tags & Register Link */}
                      <div className="pt-3 border-t border-border mt-3 flex items-center justify-between gap-4 shrink-0">
                        {/* Theme Badges */}
                        <div className="flex gap-1.5 overflow-hidden max-h-6 flex-1">
                          {h.themes.slice(0, 2).map((theme) => (
                            <span
                              key={theme}
                              className="px-2 py-0.5 text-[9px] font-black border border-black dark:border-zinc-800 rounded bg-secondary text-secondary-foreground uppercase"
                            >
                              {theme}
                            </span>
                          ))}
                        </div>

                        {/* Button Link */}
                        <a
                          href={h.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0"
                        >
                          <Button className="bg-primary text-primary-foreground border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all font-bold text-xs px-3 py-1.5 flex items-center gap-1">
                            Join <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-6 mt-12">
                  <Button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="bg-card hover:bg-muted text-foreground border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] font-bold text-xs uppercase px-4 h-11 flex items-center gap-1 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </Button>
                  <span className="font-head font-bold text-sm tracking-widest uppercase">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="bg-card hover:bg-muted text-foreground border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] font-bold text-xs uppercase px-4 h-11 flex items-center gap-1 disabled:opacity-50"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-card border-2 border-dashed border-border rounded-3xl">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-head text-2xl font-bold mb-2">No hackathons match your search</h3>
              <p className="text-muted-foreground mb-6">Try clearing your filters or search keywords!</p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setLocationFilter("all");
                  setSelectedCountry("all");
                  setSelectedState("all");
                  setSelectedCity("all");
                  setSelectedTheme("all");
                  setSelectedSort("newest");
                }}
                className="bg-primary text-primary-foreground border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all font-bold px-6"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
