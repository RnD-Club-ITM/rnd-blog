"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/retroui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      <div className="border-4 border-black dark:border-border bg-card p-8 rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-md w-full">
        <h2 className="font-head text-3xl font-black mb-2 text-red-500">Something went wrong!</h2>
        <p className="text-sm text-muted-foreground mb-6 font-medium">
          {error.message || "An unexpected error occurred while rendering the page."}
        </p>
        <Button
          onClick={() => reset()}
          className="w-full bg-primary text-primary-foreground border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold uppercase text-xs py-3"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}
