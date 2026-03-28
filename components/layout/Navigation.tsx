"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/retroui/Button";
import { ThemeToggle } from "./ThemeToggle";
import {
  FaBolt,
  FaCompass,
  FaScroll,
  FaHandshake,
  FaTrophy,
  FaUser,
  FaBars,
  FaXmark,
  FaCalendar,
} from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/explore", label: "Explore", icon: <FaCompass /> },
  { href: "/quests", label: "Quests", icon: <FaScroll /> },
  { href: "/events", label: "Events", icon: <FaCalendar /> },
  { href: "/collaborate", label: "Collaborate", icon: <FaHandshake /> },
  { href: "/leaderboard", label: "Leaderboard", icon: <FaTrophy /> },
  { href: "/admin", label: "Admin", icon: <FaUser /> },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="sticky top-0 z-50 w-full border-b-4 border-black bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="font-head text-2xl font-bold flex items-center gap-1"
          >
            SPARK <FaBolt className="text-primary text-xl" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-body transition-colors flex items-center gap-2 ${isActive(link.href)
                  ? "text-primary border-b-2 border-primary"
                  : "text-foreground hover:text-primary"
                  }`}
              >
                {link.icon} {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />

            {/* Desktop Only Buttons */}
            <div className="hidden sm:flex items-center gap-4">
              <SignedIn>
                <Link href="/create">
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground border-brutal shadow-brutal hover:shadow-brutal-sm transition-all"
                  >
                    Create +
                  </Button>
                </Link>
              </SignedIn>
            </div>

            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 sm:w-10 sm:h-10 border-2 border-black",
                    userButtonPopoverCard: "border-brutal shadow-brutal",
                  },
                }}
                afterSignOutUrl="/"
              >
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="My Spark Profile"
                    labelIcon={<FaUser />}
                    onClick={() => router.push(`/profile/${user?.id}`)}
                  />
                </UserButton.MenuItems>
              </UserButton>
            </SignedIn>

            <SignedOut>
              <Link href="/sign-in">
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground border-brutal shadow-brutal hover:shadow-brutal-sm transition-all text-xs sm:text-sm"
                >
                  Get Started
                </Button>
              </Link>
            </SignedOut>

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMenu}
              className="p-2 md:hidden border-2 border-brutal rounded-lg bg-card shadow-brutal active:shadow-none transition-all"
            >
              {isMenuOpen ? <FaXmark size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-[68px] right-0 bottom-0 w-[280px] bg-background border-l-4 border-brutal z-50 md:hidden p-6 overflow-y-auto"
            >
              <div className="flex flex-col gap-6">
                <SignedIn>
                  <Link href="/create" onClick={toggleMenu}>
                    <Button className="w-full bg-primary text-primary-foreground border-brutal shadow-brutal font-bold text-lg mb-4">
                      Create Post +
                    </Button>
                  </Link>
                </SignedIn>

                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={toggleMenu}
                    className={`font-head text-xl font-bold flex items-center gap-3 p-2 rounded-lg transition-all ${isActive(link.href)
                      ? "bg-primary/10 text-primary border-2 border-primary shadow-brutal-sm"
                      : "text-foreground hover:bg-muted"
                      }`}
                  >
                    <span className="text-2xl">{link.icon}</span>
                    {link.label}
                  </Link>
                ))}

                <div className="mt-8 pt-8 border-t-2 border-border">
                  <p className="text-sm text-muted-foreground text-center font-body">
                    ITM RnD Club • SPARK ⚡
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
