"use client";

import { useEffect, useMemo, useState } from "react";
import { useConvex, useMutation } from "convex/react";
import { Activity, Eye, Sparkles } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { generateClientId } from "@/lib/utils/generateClientId";

const VISITOR_STORAGE_KEY = "spark-visitor-id";

function formatVisitors(totalVisitors: number | null | undefined) {
  if (typeof totalVisitors !== "number") {
    return "Live";
  }

  return new Intl.NumberFormat("en-IN").format(totalVisitors);
}

type VisitorStats = {
  totalVisitors: number;
  lastUpdatedAt: number | null;
};

function VisitorCounterLive() {
  const convex = useConvex();
  const trackVisitor = useMutation(api.siteAnalytics.trackVisitor);
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [isTracking, setIsTracking] = useState(true);
  const [isUnavailable, setIsUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        const nextStats = await convex.query(api.siteAnalytics.getVisitorStats, {});
        if (!cancelled) {
          setStats(nextStats);
          setIsUnavailable(false);
        }
      } catch (error) {
        console.warn("Visitor stats unavailable:", error);
        if (!cancelled) {
          setIsUnavailable(true);
        }
      }
    }

    async function registerVisitor() {
      const existingVisitorId = window.localStorage.getItem(VISITOR_STORAGE_KEY);
      const visitorId = existingVisitorId ?? generateClientId();

      if (!existingVisitorId) {
        window.localStorage.setItem(VISITOR_STORAGE_KEY, visitorId);
      }

      try {
        await trackVisitor({ visitorId });
        await loadStats();
      } catch (error) {
        console.warn("Visitor tracking unavailable:", error);
        if (!cancelled) {
          setIsUnavailable(true);
        }
      } finally {
        if (!cancelled) {
          setIsTracking(false);
        }
      }
    }

    void loadStats();
    void registerVisitor();

    return () => {
      cancelled = true;
    };
  }, [convex, trackVisitor]);

  const statusLabel = useMemo(() => {
    if (isUnavailable) {
      return "Community momentum";
    }

    if (isTracking || stats === null) {
      return "Refreshing count";
    }

    return "Unique visitors";
  }, [isTracking, isUnavailable, stats]);

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border-2 border-brutal bg-card px-5 py-5 shadow-brutal sm:px-6">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-orange-500 via-yellow-400 to-red-500" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            {statusLabel}
          </p>
          <div className="mt-3 flex items-end gap-3">
            <span className="font-head text-4xl font-black leading-none sm:text-5xl">
              {isUnavailable ? "Growing" : formatVisitors(stats?.totalVisitors)}
            </span>
            <span className="pb-1 text-sm font-medium text-muted-foreground">
              people
            </span>
          </div>
        </div>
        <div className="rounded-2xl border-2 border-brutal bg-background p-3 shadow-brutal-sm">
          <Eye className="h-6 w-6 text-primary" />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
        <div className="inline-flex items-center gap-2 rounded-full border-2 border-brutal bg-background px-3 py-2 font-medium">
          <Activity className="h-4 w-4 text-green-600" />
          Always-on social proof
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border-2 border-brutal bg-primary/10 px-3 py-2 font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          {isUnavailable
            ? "Connect Convex deployment to enable live counts"
            : "Auto-updates on every new device"}
        </div>
      </div>
    </div>
  );
}

export function VisitorCounter({ enabled }: { enabled: boolean }) {
  if (!enabled) {
    return (
      <div className="relative overflow-hidden rounded-[1.75rem] border-2 border-dashed border-brutal bg-card px-5 py-5 shadow-brutal sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Community momentum
        </p>
        <div className="mt-3 flex items-end gap-3">
          <span className="font-head text-4xl font-black leading-none sm:text-5xl">
            Growing
          </span>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Add `NEXT_PUBLIC_CONVEX_URL` to show the live visitor count here.
        </p>
      </div>
    );
  }

  return <VisitorCounterLive />;
}

export function StatPill({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-brutal bg-card px-3 py-4 shadow-brutal-sm sm:px-4",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-head text-xl font-black sm:text-2xl">{value}</p>
    </div>
  );
}
