import React from "react";
import Link from "next/link";
import { Button } from "@/components/retroui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      <div className="border-4 border-black dark:border-border bg-card p-8 rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-md w-full">
        <h2 className="font-head text-4xl font-black mb-2 text-primary">404</h2>
        <h3 className="font-head text-xl font-bold mb-2">Page Not Found</h3>
        <p className="text-sm text-muted-foreground mb-6 font-medium">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/">
          <Button className="w-full bg-primary text-primary-foreground border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold uppercase text-xs py-3">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
