"use client";

import React, { useState } from "react";
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
  Menu,
  X,
  Calendar,
  Newspaper,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { neobrutalAuth } from "@/lib/clerk-theme";

const navLinks = [
  { href: "/explore", label: "Explore", icon: <Compass className="w-5 h-5" /> },
  { href: "/quests", label: "Quests", icon: <ScrollText className="w-5 h-5" /> },
  { href: "/hackathons", label: "Hackathons", icon: <Trophy className="w-5 h-5" /> },
  { href: "/news", label: "News", icon: <Newspaper className="w-5 h-5" /> },
  { href: "/events", label: "Events", icon: <Calendar className="w-5 h-5" /> },
  { href: "/collaborate", label: "Collaborate", icon: <Handshake className="w-5 h-5" /> },
  { href: "/leaderboard", label: "Leaderboard", icon: <Trophy className="w-5 h-5" /> },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b-4 border-black bg-background">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="font-head text-2xl font-bold flex items-center gap-1 group"
            >
              <span className="group-hover:text-primary transition-colors">SPARK</span>
              <Zap className="text-primary text-xl fill-primary transition-transform group-hover:scale-125" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-head text-sm uppercase tracking-wider transition-all hover:scale-105 ${isActive(link.href)
                    ? "text-primary border-b-2 border-primary"
                    : "text-foreground hover:text-primary"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    {link.icon}
                    {link.label}
                  </div>
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Mobile-only Leaderboard Icon */}
              <div className="md:hidden">
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
                      className="bg-primary text-primary-foreground border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-head uppercase tracking-wider px-4"
                    >
                      Create +
                    </Button>
                  </Link>
                </div>
              </SignedIn>

              <SignedIn>
                <div className="hover:scale-110 transition-transform">
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
                    className="bg-primary text-primary-foreground border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-xs font-head uppercase tracking-widest"
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
      <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-border bg-background md:hidden pb-safe">
        <div className="flex items-end justify-between px-1 pt-2 pb-2 relative">
          
          {/* Left Items */}
          <div className="flex flex-1 justify-around">
            {navLinks.filter(l => l.href !== "/leaderboard").slice(0, 3).map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex flex-col items-center justify-center gap-1.5 p-1 transition-colors ${active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {React.cloneElement(link.icon as React.ReactElement<any>, {
                    size: 20,
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
              <div className="bg-[#FF6B35] text-white p-3.5 rounded-2xl shadow-[0_8px_16px_rgba(255,107,53,0.3)] hover:scale-105 active:scale-95 transition-all mx-auto">
                <Zap size={22} className="fill-current" />
              </div>
            </Link>
          </div>

          {/* Right Items */}
          <div className="flex flex-1 justify-around">
            {navLinks.filter(l => l.href !== "/leaderboard").slice(3).map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex flex-col items-center justify-center gap-1.5 p-1 transition-colors ${active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {React.cloneElement(link.icon as React.ReactElement<any>, {
                    size: 20,
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
