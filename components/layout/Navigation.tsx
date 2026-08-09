"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/retroui/Button";
import { ThemeToggle } from "./ThemeToggle";
import {
  Zap,
  Compass,
  ScrollText,
  Handshake,
  Trophy,
  User,
  Calendar,
  Newspaper,
  GraduationCap,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { neobrutalAuth } from "@/lib/clerk-theme";

const primaryNavLinks = [
  { href: "/explore", label: "Explore", icon: <Compass className="w-4 h-4" /> },
  { href: "/resources", label: "Perks", icon: <GraduationCap className="w-4 h-4 text-orange-500" />, badge: "FREE" },
  { href: "/quests", label: "Quests", icon: <ScrollText className="w-4 h-4" /> },
  { href: "/hackathons", label: "Hackathons", icon: <Trophy className="w-4 h-4" /> },
  { href: "/news", label: "News", icon: <Newspaper className="w-4 h-4" /> },
];

const moreNavLinks = [
  { href: "/events", label: "Events", icon: <Calendar className="w-4 h-4 text-emerald-500" />, desc: "Upcoming meetups & workshops" },
  { href: "/collaborate", label: "Collaborate", icon: <Handshake className="w-4 h-4 text-blue-500" />, desc: "Find project co-builders" },
  { href: "/leaderboard", label: "Leaderboard", icon: <Trophy className="w-4 h-4 text-yellow-500" />, desc: "Top contributors ranking" },
];

const allNavLinks = [...primaryNavLinks, ...moreNavLinks];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => pathname === path;
  const isMoreActive = moreNavLinks.some((link) => pathname === link.href);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b-4 border-black bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="font-head text-2xl font-bold flex items-center gap-1 group shrink-0"
            >
              <span className="group-hover:text-primary transition-colors">SPARK</span>
              <Zap className="text-primary text-xl fill-primary transition-transform group-hover:scale-125" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              {primaryNavLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`font-head text-xs uppercase tracking-wider px-3 py-2 rounded-xl transition-all flex items-center gap-2 relative ${
                      active
                        ? "bg-primary/10 text-primary font-black border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                        : "text-foreground hover:bg-muted hover:text-primary font-bold border-2 border-transparent"
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-black bg-yellow-400 text-black border border-black rounded shadow-[1px_1px_0_0_rgba(0,0,0,1)] leading-none">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* More Dropdown */}
              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className={`font-head text-xs uppercase tracking-wider px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    isMoreActive || isMoreOpen
                      ? "bg-primary/10 text-primary font-black border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                      : "text-foreground hover:bg-muted hover:text-primary font-bold border-2 border-transparent"
                  }`}
                >
                  <span>More</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMoreOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isMoreOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-card border-4 border-black dark:border-border rounded-2xl shadow-[6px_6px_0_0_rgba(0,0,0,1)] dark:shadow-[6px_6px_0_0_rgba(255,255,255,0.1)] p-2 z-50 overflow-hidden"
                    >
                      {moreNavLinks.map((item) => {
                        const active = isActive(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMoreOpen(false)}
                            className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                              active ? "bg-primary/15 text-primary" : "hover:bg-muted text-foreground"
                            }`}
                          >
                            <div className="p-2 rounded-lg border-2 border-black bg-background shrink-0 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                              {item.icon}
                            </div>
                            <div>
                              <div className="font-head text-xs font-black uppercase tracking-wider">
                                {item.label}
                              </div>
                              <div className="text-[10px] text-muted-foreground font-medium">
                                {item.desc}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Mobile-only Leaderboard Icon */}
              <div className="lg:hidden">
                <Link
                  href="/leaderboard"
                  className={`p-2 rounded-lg flex items-center justify-center transition-colors ${isActive("/leaderboard") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
                >
                  <Trophy size={20} className={isActive("/leaderboard") ? "stroke-[2.5px]" : "stroke-[2px]"} />
                </Link>
              </div>

              <ThemeToggle />

              <SignedIn>
                <div className="hidden sm:block">
                  <Link href="/create">
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all font-head uppercase tracking-wider px-3.5 py-1.5 text-xs"
                    >
                      Create +
                    </Button>
                  </Link>
                </div>
              </SignedIn>

              <SignedIn>
                <div className="hover:scale-105 transition-transform">
                  <UserButton
                    appearance={neobrutalAuth}
                    afterSignOutUrl="/"
                  >
                    <UserButton.MenuItems>
                      <UserButton.Action
                        label="My Spark Profile"
                        labelIcon={<User className="w-4 h-4" />}
                        onClick={() => router.push(`/profile/${user?.id}`)}
                      />
                    </UserButton.MenuItems>
                  </UserButton>
                </div>
              </SignedIn>

              <SignedOut>
                <Link href="/sign-in">
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-xs font-head uppercase tracking-widest px-3.5 py-1.5"
                  >
                    Sign In
                  </Button>
                </Link>
              </SignedOut>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] border-t-2 border-black bg-background lg:hidden pb-safe">
        <div className="flex items-end justify-between px-1 pt-2 pb-2 relative">
          
          {/* Left Items */}
          <div className="flex flex-1 justify-around">
            {allNavLinks.slice(0, 3).map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex flex-col items-center justify-center gap-1 p-1 transition-colors ${active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {React.cloneElement(link.icon as React.ReactElement<any>, {
                    size: 18,
                    className: active ? "stroke-[2.5px]" : "stroke-[2px]"
                  })}
                  <span className={`text-[9px] font-head uppercase tracking-widest ${active ? "font-black" : "font-bold"}`}>
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Center Button */}
          <div className="flex-shrink-0 px-2 relative -top-3 z-10">
            <Link href="/create">
              <div className="bg-[#FF6B35] text-white p-3 rounded-2xl shadow-[0_8px_16px_rgba(255,107,53,0.3)] border-2 border-black hover:scale-105 active:scale-95 transition-all mx-auto">
                <Zap size={20} className="fill-current" />
              </div>
            </Link>
          </div>

          {/* Right Items */}
          <div className="flex flex-1 justify-around">
            {allNavLinks.slice(3, 6).map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex flex-col items-center justify-center gap-1 p-1 transition-colors ${active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {React.cloneElement(link.icon as React.ReactElement<any>, {
                    size: 18,
                    className: active ? "stroke-[2.5px]" : "stroke-[2px]"
                  })}
                  <span className={`text-[9px] font-head uppercase tracking-widest ${active ? "font-black" : "font-bold"}`}>
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>

        </div>
      </div>
    </>
  );
}

