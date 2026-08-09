"use client";

import React, { useState, useMemo } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/retroui/Button";
import {
  Search,
  GraduationCap,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  X,
  CreditCard,
  Gift,
  Zap,
  Laptop,
  Code,
  Cloud,
  Palette,
  BookOpen,
  Filter,
  ArrowRight,
  Send,
  Building,
  Tag,
  Star,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface StudentPerk {
  id: string;
  name: string;
  provider: string;
  category: "dev" | "ai" | "cloud" | "design" | "productivity" | "learning";
  categoryLabel: string;
  valueBadge: string;
  estimatedValue: number; // For sorting by monetary value
  verificationMethod: "id_card" | "edu_email" | "github_pack" | "sheerid";
  verificationMethodLabel: string;
  iconBg: string;
  shortDescription: string;
  requirements: string[];
  claimUrl: string;
  featured?: boolean;
  steps: {
    stepNumber: number;
    title: string;
    description: string;
  }[];
  proTips?: string[];
}

const STUDENT_PERKS: StudentPerk[] = [
  {
    id: "github-student-pack",
    name: "GitHub Student Developer Pack",
    provider: "GitHub Education",
    category: "dev",
    categoryLabel: "Developer Tools",
    valueBadge: "$2,000+ VALUE FREE",
    estimatedValue: 2000,
    verificationMethod: "id_card",
    verificationMethodLabel: "🪪 Student ID / 📧 .edu Email",
    iconBg: "bg-zinc-900 text-white dark:bg-zinc-800",
    shortDescription:
      "Unlock 100+ premium developer tools including GitHub Copilot, DigitalOcean, JetBrains, Namecheap, and Termius for 100% free.",
    requirements: [
      "Valid Student ID Card photo OR institutional .edu email",
      "Active GitHub Account",
      "Proof of current academic enrollment (e.g. tuition receipt, schedule)",
    ],
    claimUrl: "https://education.github.com/pack",
    featured: true,
    steps: [
      {
        stepNumber: 1,
        title: "Log in to GitHub",
        description: "Sign into your existing GitHub account or create a new personal account at github.com.",
      },
      {
        stepNumber: 2,
        title: "Visit GitHub Education Portal",
        description: "Go to education.github.com/pack and click on 'Get your pack'.",
      },
      {
        stepNumber: 3,
        title: "Submit Verification Info",
        description:
          "Select your school name. Add your school email or upload a clear photo of your Student ID card showing your name, school name, and current year.",
      },
      {
        stepNumber: 4,
        title: "Approval & Activation",
        description:
          "Verification usually takes between 1 to 48 hours. Once approved, you will receive an email and all 100+ partner tools will unlock automatically.",
      },
    ],
    proTips: [
      "Ensure your photo ID scan clearly displays an expiration date or current academic year (2024-2026).",
      "Disable VPNs when applying so your geolocation matches your school location.",
    ],
  },
  {
    id: "jetbrains-student-pack",
    name: "JetBrains All Products Pack",
    provider: "JetBrains",
    category: "dev",
    categoryLabel: "Developer Tools",
    valueBadge: "$649 / yr FREE",
    estimatedValue: 649,
    verificationMethod: "id_card",
    verificationMethodLabel: "🪪 Student ID / 📧 .edu Email",
    iconBg: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
    shortDescription:
      "Full free access to all professional IDEs: IntelliJ IDEA Ultimate, PyCharm Pro, WebStorm, CLion, DataGrip, GoLand, and Rider.",
    requirements: [
      "Official Student ID card image upload OR .edu university email",
      "ISIC Card or official enrollment document",
    ],
    claimUrl: "https://www.jetbrains.com/community/education/#students",
    featured: true,
    steps: [
      {
        stepNumber: 1,
        title: "Navigate to JetBrains Education",
        description: "Go to jetbrains.com/community/education/#students and click 'Apply now'.",
      },
      {
        stepNumber: 2,
        title: "Choose Verification Method",
        description:
          "Select 'University email address' if you have a .edu email, or select 'Official document' to upload a photo of your physical Student ID card.",
      },
      {
        stepNumber: 3,
        title: "Complete Application Form",
        description: "Enter your full name, educational institution, and submit your email or ID photo.",
      },
      {
        stepNumber: 4,
        title: "Activate JetBrains License",
        description:
          "Check your inbox for a confirmation link. Log into your JetBrains Account to activate your 1-year free license (renewable every student year).",
      },
    ],
    proTips: [
      "You can renew this license every year as long as you remain an active student!",
    ],
  },
  {
    id: "figma-education",
    name: "Figma Professional for Education",
    provider: "Figma",
    category: "design",
    categoryLabel: "Design & Prototyping",
    valueBadge: "$144 / yr FREE",
    estimatedValue: 144,
    verificationMethod: "id_card",
    verificationMethodLabel: "🪪 Student ID / 📧 .edu Email",
    iconBg: "bg-red-500 text-white",
    shortDescription:
      "Free Figma Professional plan for students & educators: unlimited Figma & FigJam files, team libraries, advanced prototyping, and Dev Mode.",
    requirements: [
      "Figma Account",
      "Student ID card photo OR school schedule showing current dates",
    ],
    claimUrl: "https://www.figma.com/education/apply",
    featured: true,
    steps: [
      {
        stepNumber: 1,
        title: "Create a Free Figma Account",
        description: "Sign up at figma.com using your personal or school email.",
      },
      {
        stepNumber: 2,
        title: "Apply for Education Status",
        description: "Visit figma.com/education/apply and choose 'Student'.",
      },
      {
        stepNumber: 3,
        title: "Upload Verification",
        description:
          "Fill in your school name and upload a screenshot or photo of your Student ID card or course schedule.",
      },
      {
        stepNumber: 4,
        title: "Upgrade Team Workspace",
        description:
          "Once verified (instant or within 24h), create a team inside Figma and upgrade it to Education Status for free.",
      },
    ],
    proTips: [
      "Include a direct link to your school website or portal if prompted during verification.",
    ],
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot (AI Pair Programmer)",
    provider: "GitHub / OpenAI",
    category: "ai",
    categoryLabel: "AI & Machine Learning",
    valueBadge: "$100 / yr FREE",
    estimatedValue: 100,
    verificationMethod: "github_pack",
    verificationMethodLabel: "🐙 GitHub Student Pack",
    iconBg: "bg-indigo-600 text-white",
    shortDescription:
      "Get 100% free access to GitHub Copilot in VS Code, JetBrains, Visual Studio, and Neovim to write code faster with real-time AI assistance.",
    requirements: [
      "Approved GitHub Student Developer Pack status",
      "VS Code or JetBrains IDE",
    ],
    claimUrl: "https://github.com/settings/copilot",
    featured: true,
    steps: [
      {
        stepNumber: 1,
        title: "Ensure GitHub Student Status",
        description: "Verify your student status via the GitHub Student Developer Pack first.",
      },
      {
        stepNumber: 2,
        title: "Go to Copilot Settings",
        description: "Visit github.com/settings/copilot while logged into your verified student GitHub account.",
      },
      {
        stepNumber: 3,
        title: "Enable Free Subscription",
        description: "Click 'Get GitHub Copilot for free as a student' and confirm your telemetry preferences.",
      },
      {
        stepNumber: 4,
        title: "Install Extension in Code Editor",
        description: "Open VS Code, install the 'GitHub Copilot' extension, sign in with GitHub, and start coding!",
      },
    ],
  },
  {
    id: "azure-students",
    name: "Microsoft Azure for Students",
    provider: "Microsoft Azure",
    category: "cloud",
    categoryLabel: "Cloud & Hosting",
    valueBadge: "$100 CREDIT + 25+ FREE SERVICES",
    estimatedValue: 100,
    verificationMethod: "sheerid",
    verificationMethodLabel: "🛡️ SheerID / 📧 .edu Email",
    iconBg: "bg-blue-600 text-white",
    shortDescription:
      "Claim $100 free Azure cloud credits renewing annually + 12 months of free popular services (App Service, Azure SQL, VMs) with NO credit card required.",
    requirements: [
      "School .edu email address OR SheerID Student Verification",
      "Phone number for SMS verification",
      "No credit card required!",
    ],
    claimUrl: "https://azure.microsoft.com/free/students",
    featured: true,
    steps: [
      {
        stepNumber: 1,
        title: "Visit Azure for Students",
        description: "Go to azure.microsoft.com/free/students and click 'Activate now'.",
      },
      {
        stepNumber: 2,
        title: "Sign in with Microsoft Account",
        description: "Log into your Microsoft account (or create one using your personal or school email).",
      },
      {
        stepNumber: 3,
        title: "Verify Student Status",
        description: "Enter your school email or upload your student ID card via SheerID verification.",
      },
      {
        stepNumber: 4,
        title: "Access Azure Portal",
        description: "Complete SMS verification. Your $100 Azure credit will immediately show in your Azure Portal balance.",
      },
    ],
    proTips: [
      "Unlike standard Azure free trial, the student offer DOES NOT require any credit card!",
    ],
  },
  {
    id: "notion-education",
    name: "Notion Plus + Education AI",
    provider: "Notion",
    category: "productivity",
    categoryLabel: "Productivity & OS",
    valueBadge: "$120 / yr FREE",
    estimatedValue: 120,
    verificationMethod: "edu_email",
    verificationMethodLabel: "📧 .edu Email",
    iconBg: "bg-black text-white dark:bg-zinc-800",
    shortDescription:
      "Get free Notion Plus Plan with unlimited file uploads, unlimited page history, and custom student templates.",
    requirements: [
      "School email ending in .edu, .ac.uk, .edu.in or recognized school domain",
    ],
    claimUrl: "https://www.notion.so/product/notion-for-education",
    steps: [
      {
        stepNumber: 1,
        title: "Sign up with Student Email",
        description: "Sign into Notion or create a new account using your official student email address.",
      },
      {
        stepNumber: 2,
        title: "Go to Workspace Settings",
        description: "Click on 'Settings & Members' in the left sidebar and navigate to 'Upgrade' or 'Plans'.",
      },
      {
        stepNumber: 3,
        title: "Claim Free Education Plan",
        description: "Scroll down to the bottom of the plans page and click 'Get free Education Plan'.",
      },
      {
        stepNumber: 4,
        title: "Instant Upgrade",
        description: "Your workspace plan will instantly switch to Notion Plus for $0/month.",
      },
    ],
  },
  {
    id: "autodesk-student",
    name: "Autodesk Education Suite (Fusion 360, AutoCAD, Maya)",
    provider: "Autodesk",
    category: "design",
    categoryLabel: "Design & Prototyping",
    valueBadge: "$1,800+ / yr FREE",
    estimatedValue: 1800,
    verificationMethod: "sheerid",
    verificationMethodLabel: "🛡️ SheerID / 🪪 Student ID",
    iconBg: "bg-cyan-600 text-white",
    shortDescription:
      "100% free 1-year renewable student access to AutoCAD, Fusion 360, Maya, 3ds Max, Revit, and Inventor.",
    requirements: [
      "Official Student ID card image OR tuition fee receipt / official transcript",
      "Verified via SheerID portal",
    ],
    claimUrl: "https://www.autodesk.com/education/free-software",
    steps: [
      {
        stepNumber: 1,
        title: "Create Autodesk Education Account",
        description: "Visit autodesk.com/education/free-software and click 'Get Started'.",
      },
      {
        stepNumber: 2,
        title: "Complete SheerID Verification",
        description:
          "Select your country and institution. Upload a clear photo of your Student ID card showing your name, school, and current year.",
      },
      {
        stepNumber: 3,
        title: "Receive Confirmation",
        description: "SheerID will review your document within 5–15 minutes and send an approval notification.",
      },
      {
        stepNumber: 4,
        title: "Download Software",
        description: "Return to the Autodesk portal and download any professional software suite for free.",
      },
    ],
  },
  {
    id: "digitalocean-student",
    name: "DigitalOcean $200 Cloud Credit",
    provider: "DigitalOcean",
    category: "cloud",
    categoryLabel: "Cloud & Hosting",
    valueBadge: "$200 CREDIT FREE",
    estimatedValue: 200,
    verificationMethod: "github_pack",
    verificationMethodLabel: "🐙 GitHub Student Pack",
    iconBg: "bg-sky-500 text-white",
    shortDescription:
      "Host web applications, cloud servers, and databases with $200 in free DigitalOcean credits valid for 1 year.",
    requirements: [
      "Active GitHub Student Developer Pack",
      "New DigitalOcean Account",
    ],
    claimUrl: "https://education.github.com/pack",
    steps: [
      {
        stepNumber: 1,
        title: "Access GitHub Student Pack",
        description: "Log into education.github.com/pack with your approved student GitHub account.",
      },
      {
        stepNumber: 2,
        title: "Find DigitalOcean Offer",
        description: "Locate DigitalOcean in the offers list and click 'Get your unique link'.",
      },
      {
        stepNumber: 3,
        title: "Create Account via Promo Link",
        description: "Sign up for DigitalOcean using the unique URL provided by GitHub.",
      },
      {
        stepNumber: 4,
        title: "Redeem $200 Credit",
        description: "Your $200 promo credit will be automatically applied to your billing dashboard.",
      },
    ],
  },
  {
    id: "termius-pro",
    name: "Termius PRO SSH Client",
    provider: "Termius",
    category: "dev",
    categoryLabel: "Developer Tools",
    valueBadge: "$120 / yr FREE",
    estimatedValue: 120,
    verificationMethod: "github_pack",
    verificationMethodLabel: "🐙 GitHub Student Pack",
    iconBg: "bg-zinc-800 text-white",
    shortDescription:
      "Cross-platform SSH & SFTP client with encrypted snippet sync, autocomplete, and multi-device connection manager.",
    requirements: [
      "Active GitHub Student Developer Pack",
      "Termius Account",
    ],
    claimUrl: "https://termius.com/education",
    steps: [
      {
        stepNumber: 1,
        title: "Open Termius Education Portal",
        description: "Visit termius.com/education or claim through the GitHub Student Developer Pack.",
      },
      {
        stepNumber: 2,
        title: "Sign in with GitHub",
        description: "Log in using your GitHub account that has student status verified.",
      },
      {
        stepNumber: 3,
        title: "Unlock Termius PRO",
        description: "Termius PRO features will activate automatically across macOS, Windows, iOS, and Android.",
      },
    ],
  },
  {
    id: "namecheap-me-domain",
    name: "Namecheap Free .me Domain + SSL",
    provider: "Namecheap",
    category: "learning",
    categoryLabel: "Learning & Domains",
    valueBadge: "1 YEAR DOMAIN + SSL FREE",
    estimatedValue: 20,
    verificationMethod: "github_pack",
    verificationMethodLabel: "🐙 GitHub Student Pack",
    iconBg: "bg-orange-600 text-white",
    shortDescription:
      "Register a custom 1-year .me domain for your developer portfolio plus a free PositiveSSL security certificate.",
    requirements: [
      "GitHub Student Developer Pack",
    ],
    claimUrl: "https://nc.me/",
    steps: [
      {
        stepNumber: 1,
        title: "Visit nc.me",
        description: "Go to nc.me (Namecheap Education portal) or click through the GitHub Student Pack.",
      },
      {
        stepNumber: 2,
        title: "Search Desired .me Domain",
        description: "Type in your personal portfolio domain name (e.g. yourname.me) and check availability.",
      },
      {
        stepNumber: 3,
        title: "Authenticate with GitHub",
        description: "Click 'Sign in with GitHub' to verify your active student status.",
      },
      {
        stepNumber: 4,
        title: "Complete $0 Checkout",
        description: "Finish the checkout process to own your domain name for 1 year with free SSL protection.",
      },
    ],
  },
  {
    id: "tableplus-student",
    name: "TablePlus Database GUI",
    provider: "TablePlus",
    category: "dev",
    categoryLabel: "Developer Tools",
    valueBadge: "$79 VALUE FREE",
    estimatedValue: 79,
    verificationMethod: "id_card",
    verificationMethodLabel: "🪪 Student ID / 📧 .edu Email",
    iconBg: "bg-amber-600 text-white",
    shortDescription:
      "Modern, native database GUI tool for PostgreSQL, MySQL, Redis, SQLite, MongoDB, and SQL Server.",
    requirements: [
      "Student ID Card photo OR active .edu student email address",
    ],
    claimUrl: "https://tableplus.com/blog/2019/08/tableplus-education-license.html",
    steps: [
      {
        stepNumber: 1,
        title: "Check TablePlus Education Policy",
        description: "Visit tableplus.com education licensing page.",
      },
      {
        stepNumber: 2,
        title: "Email Support with Verification",
        description:
          "Send an email to support@tableplus.com from your student email address or attach a photo of your Student ID card.",
      },
      {
        stepNumber: 3,
        title: "Receive License Key",
        description: "TablePlus support will issue a free 1-year student license key for your machine.",
      },
    ],
  },
  {
    id: "datacamp-student",
    name: "DataCamp (3 Months Full Access)",
    provider: "DataCamp",
    category: "learning",
    categoryLabel: "Learning & Domains",
    valueBadge: "$150 VALUE FREE",
    estimatedValue: 150,
    verificationMethod: "github_pack",
    verificationMethodLabel: "🐙 GitHub Student Pack",
    iconBg: "bg-emerald-700 text-white",
    shortDescription:
      "Master Python, R, SQL, Machine Learning, and Data Science with 3 months of unlimited interactive courses.",
    requirements: [
      "Active GitHub Student Developer Pack",
    ],
    claimUrl: "https://www.datacamp.com/github-students",
    steps: [
      {
        stepNumber: 1,
        title: "Locate DataCamp Offer",
        description: "Find DataCamp in your GitHub Student Developer Pack dashboard.",
      },
      {
        stepNumber: 2,
        title: "Link Account",
        description: "Click 'Get 3 Months Free' and log into DataCamp using your student GitHub account.",
      },
      {
        stepNumber: 3,
        title: "Start Learning",
        description: "Access all premium interactive tracks, coding challenges, and career certifications.",
      },
    ],
  },
  {
    id: "mongodb-atlas-student",
    name: "MongoDB Atlas Credits + Free Certification",
    provider: "MongoDB",
    category: "cloud",
    categoryLabel: "Cloud & Hosting",
    valueBadge: "$150+ VALUE FREE",
    estimatedValue: 150,
    verificationMethod: "github_pack",
    verificationMethodLabel: "🐙 GitHub Student Pack",
    iconBg: "bg-green-600 text-white",
    shortDescription:
      "Get $50 in MongoDB Atlas cloud credits + free access to MongoDB University courses and a free certification exam voucher.",
    requirements: [
      "Active GitHub Student Developer Pack",
    ],
    claimUrl: "https://www.mongodb.com/students",
    steps: [
      {
        stepNumber: 1,
        title: "Claim MongoDB Offer",
        description: "Access the MongoDB student perk via the GitHub Student Pack portal.",
      },
      {
        stepNumber: 2,
        title: "Redeem Credits",
        description: "Copy your unique voucher code and enter it under Atlas Billing -> Payment Methods.",
      },
      {
        stepNumber: 3,
        title: "Register for Exam",
        description: "Use your included certification voucher to take the MongoDB Certified Developer exam for free.",
      },
    ],
  },
  {
    id: "spotify-hulu-student",
    name: "Spotify Premium + Hulu Student Bundle",
    provider: "Spotify / Hulu",
    category: "productivity",
    categoryLabel: "Productivity & OS",
    valueBadge: "50% OFF + HULU INCLUDED",
    estimatedValue: 100,
    verificationMethod: "sheerid",
    verificationMethodLabel: "🛡️ SheerID / 🪪 Student ID",
    iconBg: "bg-emerald-500 text-white",
    shortDescription:
      "Get Spotify Premium + Hulu (with ads) bundled together for just $5.99/month, including 1st month 100% free.",
    requirements: [
      "Enrolled student at an accredited university",
      "SheerID Verification (ID upload or school portal login)",
    ],
    claimUrl: "https://www.spotify.com/us/student/",
    steps: [
      {
        stepNumber: 1,
        title: "Visit Spotify Student Page",
        description: "Go to spotify.com/us/student and click 'Get Started'.",
      },
      {
        stepNumber: 2,
        title: "Verify via SheerID",
        description: "Select your college and log into your school portal or upload your physical Student ID card photo.",
      },
      {
        stepNumber: 3,
        title: "Activate Hulu Bundle",
        description: "Once SheerID approves your student status, follow the prompt to link your Hulu account for free.",
      },
    ],
  },
];

const CATEGORIES = [
  { id: "all", label: "All Perks", icon: <Gift className="w-4 h-4" /> },
  { id: "dev", label: "Developer Tools", icon: <Code className="w-4 h-4" /> },
  { id: "ai", label: "AI & Machine Learning", icon: <Zap className="w-4 h-4" /> },
  { id: "cloud", label: "Cloud & Hosting", icon: <Cloud className="w-4 h-4" /> },
  { id: "design", label: "Design & Prototyping", icon: <Palette className="w-4 h-4" /> },
  { id: "productivity", label: "Productivity & OS", icon: <Laptop className="w-4 h-4" /> },
  { id: "learning", label: "Learning & Domains", icon: <BookOpen className="w-4 h-4" /> },
];

const VERIFICATION_METHODS = [
  { id: "all", label: "All Verification Types" },
  { id: "id_card", label: "🪪 Student ID Card" },
  { id: "edu_email", label: "📧 .edu Email" },
  { id: "github_pack", label: "🐙 GitHub Student Pack" },
  { id: "sheerid", label: "🛡️ SheerID / Portal" },
];

export default function StudentPerksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedVerification, setSelectedVerification] = useState("all");
  const [selectedSort, setSelectedSort] = useState<"value" | "popular" | "alphabetical">("value");
  const [activeModalPerk, setActiveModalPerk] = useState<StudentPerk | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitForm, setSubmitForm] = useState({ name: "", provider: "", claimUrl: "", notes: "" });
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Filter & Sort Logic
  const filteredPerks = useMemo(() => {
    let result = [...STUDENT_PERKS];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.provider.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Verification method filter
    if (selectedVerification !== "all") {
      result = result.filter((p) => p.verificationMethod === selectedVerification);
    }

    // Sort
    result.sort((a, b) => {
      if (selectedSort === "value") {
        return b.estimatedValue - a.estimatedValue;
      }
      if (selectedSort === "alphabetical") {
        return a.name.localeCompare(b.name);
      }
      // Popular (featured first)
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });

    return result;
  }, [searchQuery, selectedCategory, selectedVerification, selectedSort]);

  const totalEstimatedSavings = useMemo(() => {
    return STUDENT_PERKS.reduce((acc, p) => acc + p.estimatedValue, 0);
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setIsSubmitModalOpen(false);
      setSubmitForm({ name: "", provider: "", claimUrl: "", notes: "" });
    }, 2000);
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pb-20">
        {/* Banner Hero Section */}
        <section className="border-b-4 border-black bg-gradient-to-r from-amber-500/10 via-primary/10 to-purple-500/10 py-12 mb-8 relative overflow-hidden">
          <div className="container mx-auto px-4 max-w-6xl relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-yellow-400 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <GraduationCap className="w-4 h-4 fill-black" /> 100% Real Student Perks
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-emerald-400 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Sparkles className="w-4 h-4 fill-black" /> Verified Offers
              </span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <h1 className="font-head text-4xl sm:text-5xl lg:text-6xl font-black mb-4 tracking-tight leading-tight">
                  Free Student Tools &{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-primary to-purple-600">
                    Developer Perks Hub
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground font-medium">
                  Claim over <strong className="text-foreground font-black">${totalEstimatedSavings.toLocaleString()}+</strong> in free premium developer tools, cloud credits, AI code assistants, design suites, and certifications using your Student ID Card or school email.
                </p>
              </div>

              {/* Action Badge Stat Card */}
              <div className="border-4 border-black bg-card p-6 rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] flex flex-col items-center text-center shrink-0 min-w-[240px]">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 border-2 border-black flex items-center justify-center mb-2">
                  <Gift className="w-6 h-6 text-primary" />
                </div>
                <div className="font-head text-3xl font-black text-primary">
                  ${totalEstimatedSavings.toLocaleString()}+
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">
                  Est. Annual Student Savings
                </div>
                <Button
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="mt-4 w-full bg-primary text-primary-foreground border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all font-bold text-xs uppercase flex items-center justify-center gap-1.5 py-2"
                >
                  <Send className="w-3.5 h-3.5" /> Submit a Perk
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Search & Filter Panel */}
        <section className="container mx-auto px-4 max-w-6xl mb-8">
          <div className="border-4 border-black dark:border-border bg-card p-6 rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search perks by tool name, provider (e.g. JetBrains, Copilot, Azure, Figma)..."
                  className="h-14 w-full rounded-2xl border-2 border-black dark:border-zinc-800 bg-background pl-12 pr-4 text-base font-medium outline-none transition-colors focus:border-primary placeholder:text-muted-foreground"
                />
              </div>

              {/* Verification method dropdown */}
              <div className="relative min-w-[200px] flex-1 sm:flex-none">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
                <select
                  value={selectedVerification}
                  onChange={(e) => setSelectedVerification(e.target.value)}
                  className="h-14 w-full rounded-2xl border-2 border-black dark:border-zinc-800 bg-background pl-10 pr-8 text-xs font-bold uppercase tracking-wider outline-none appearance-none focus:border-primary cursor-pointer"
                >
                  {VERIFICATION_METHODS.map((vm) => (
                    <option key={vm.id} value={vm.id}>
                      {vm.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground font-bold text-xs">
                  ▼
                </div>
              </div>

              {/* Sort selector */}
              <div className="relative min-w-[170px] flex-1 sm:flex-none">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value as "value" | "popular" | "alphabetical")}
                  className="h-14 w-full rounded-2xl border-2 border-black dark:border-zinc-800 bg-background pl-10 pr-8 text-xs font-bold uppercase tracking-wider outline-none appearance-none focus:border-primary cursor-pointer"
                >
                  <option value="value">Highest Value</option>
                  <option value="popular">Most Popular</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground font-bold text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-dashed border-border">
              <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider mr-2">
                Categories:
              </span>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider border-2 border-black rounded-xl transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
                      : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Perks Grid Section */}
        <section className="container mx-auto px-4 max-w-6xl">
          {filteredPerks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPerks.map((perk) => (
                <div
                  key={perk.id}
                  className="bg-card text-card-foreground border-4 border-black dark:border-border rounded-3xl shadow-[6px_6px_0_0_rgba(0,0,0,1)] dark:shadow-[6px_6px_0_0_rgba(255,255,255,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-all p-6 flex flex-col justify-between relative group"
                >
                  {/* Top Badge & Header */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      {/* Provider Badge */}
                      <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-secondary text-secondary-foreground border-2 border-black rounded-lg">
                        {perk.provider}
                      </span>

                      {/* Value Badge */}
                      <span className="px-3 py-1 text-[11px] font-black uppercase tracking-wider bg-yellow-400 text-black border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                        {perk.valueBadge}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-head text-xl font-black group-hover:text-primary transition-colors mb-2 leading-snug">
                      {perk.name}
                    </h3>

                    {/* Short Description */}
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-4 line-clamp-3">
                      {perk.shortDescription}
                    </p>
                  </div>

                  {/* Requirements & Verification Tag */}
                  <div>
                    <div className="mb-4 pt-3 border-t border-dashed border-border space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="truncate">{perk.verificationMethodLabel}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 shrink-0">
                      <Button
                        onClick={() => setActiveModalPerk(perk)}
                        className="bg-card hover:bg-muted text-foreground border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] font-bold text-xs uppercase px-2 py-2 flex items-center justify-center gap-1"
                      >
                        <HelpCircle className="w-3.5 h-3.5" /> Guide
                      </Button>

                      <a
                        href={perk.claimUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full"
                      >
                        <Button className="w-full bg-primary text-primary-foreground border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all font-bold text-xs uppercase px-2 py-2 flex items-center justify-center gap-1">
                          Claim <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-card border-4 border-dashed border-border rounded-3xl">
              <Gift className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-head text-2xl font-bold mb-2">No student perks match your criteria</h3>
              <p className="text-muted-foreground mb-6">Try broadening your search keywords or resetting category filters.</p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedVerification("all");
                  setSelectedSort("value");
                }}
                className="bg-primary text-primary-foreground border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all font-bold px-6 py-2"
              >
                Reset All Filters
              </Button>
            </div>
          )}
        </section>

        {/* Step-by-Step Claim Modal */}
        <AnimatePresence>
          {activeModalPerk && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card text-card-foreground border-4 border-black dark:border-border rounded-3xl shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,0.2)] max-w-2xl w-full p-6 sm:p-8 my-8 relative overflow-hidden max-h-[90vh] flex flex-col justify-between"
              >
                {/* Close Button */}
                <button
                  onClick={() => setActiveModalPerk(null)}
                  className="absolute top-4 right-4 p-2 rounded-xl border-2 border-black bg-background hover:bg-muted transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Modal Header */}
                <div className="overflow-y-auto pr-2 space-y-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-3 py-1 text-xs font-black uppercase tracking-wider bg-yellow-400 text-black border-2 border-black rounded-lg">
                        {activeModalPerk.valueBadge}
                      </span>
                      <span className="px-3 py-1 text-xs font-black uppercase tracking-wider bg-secondary border-2 border-black rounded-lg">
                        {activeModalPerk.provider}
                      </span>
                    </div>
                    <h2 className="font-head text-2xl sm:text-3xl font-black leading-tight">
                      Step-by-Step Claim Guide: {activeModalPerk.name}
                    </h2>
                  </div>

                  {/* Requirements Checklist */}
                  <div className="bg-muted/50 border-2 border-black p-4 rounded-2xl space-y-2">
                    <h4 className="font-head text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> What You Need Before Starting:
                    </h4>
                    <ul className="space-y-1.5 pl-5 list-disc text-xs font-semibold text-foreground">
                      {activeModalPerk.requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Numbered Steps Walkthrough */}
                  <div className="space-y-4">
                    <h4 className="font-head text-sm font-black uppercase tracking-wider">
                      📋 Step-by-Step Instructions:
                    </h4>
                    <div className="space-y-3">
                      {activeModalPerk.steps.map((step) => (
                        <div
                          key={step.stepNumber}
                          className="flex items-start gap-3 p-4 rounded-2xl border-2 border-black bg-background shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                        >
                          <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground border-2 border-black font-black text-sm flex items-center justify-center shrink-0">
                            {step.stepNumber}
                          </div>
                          <div>
                            <h5 className="font-head text-base font-bold mb-1">
                              {step.title}
                            </h5>
                            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pro Tips Section */}
                  {activeModalPerk.proTips && activeModalPerk.proTips.length > 0 && (
                    <div className="bg-yellow-500/10 border-2 border-yellow-500 text-foreground p-4 rounded-2xl space-y-1">
                      <h5 className="font-head text-xs font-black uppercase tracking-wider text-yellow-600 dark:text-yellow-400 flex items-center gap-1.5">
                        <Info className="w-4 h-4" /> Pro-Tips for Quick Verification:
                      </h5>
                      <ul className="pl-5 list-disc text-xs font-medium space-y-1">
                        {activeModalPerk.proTips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="pt-4 border-t-2 border-black mt-4 flex items-center justify-end gap-3 shrink-0">
                  <Button
                    onClick={() => setActiveModalPerk(null)}
                    className="bg-card hover:bg-muted text-foreground border-2 border-black font-bold text-xs uppercase px-4 py-2"
                  >
                    Close
                  </Button>
                  <a
                    href={activeModalPerk.claimUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="bg-primary text-primary-foreground border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all font-bold text-xs uppercase px-5 py-2 flex items-center gap-1.5">
                      Go to Official Claim Portal <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Submit a Perk Modal */}
        <AnimatePresence>
          {isSubmitModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card text-card-foreground border-4 border-black dark:border-border rounded-3xl shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,0.2)] max-w-md w-full p-6 sm:p-8 relative"
              >
                <button
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-xl border-2 border-black bg-background hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <h3 className="font-head text-2xl font-black mb-2">Submit a Student Perk</h3>
                <p className="text-xs text-muted-foreground mb-6 font-medium">
                  Know a real student offer, software discount, or free tool? Submit it here and we will verify and feature it!
                </p>

                {submitSuccess ? (
                  <div className="bg-emerald-100 border-2 border-emerald-500 text-emerald-800 p-4 rounded-2xl text-center font-bold text-sm">
                    🎉 Thank you! Your perk submission has been received for review.
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                        Tool / Perk Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={submitForm.name}
                        onChange={(e) => setSubmitForm({ ...submitForm, name: e.target.value })}
                        placeholder="e.g. Warp Terminal Pro for Students"
                        className="w-full h-11 rounded-xl border-2 border-black bg-background px-3 text-sm font-medium outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                        Provider / Company *
                      </label>
                      <input
                        type="text"
                        required
                        value={submitForm.provider}
                        onChange={(e) => setSubmitForm({ ...submitForm, provider: e.target.value })}
                        placeholder="e.g. Warp.dev"
                        className="w-full h-11 rounded-xl border-2 border-black bg-background px-3 text-sm font-medium outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                        Official Claim URL *
                      </label>
                      <input
                        type="url"
                        required
                        value={submitForm.claimUrl}
                        onChange={(e) => setSubmitForm({ ...submitForm, claimUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full h-11 rounded-xl border-2 border-black bg-background px-3 text-sm font-medium outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                        Verification Method & Details
                      </label>
                      <textarea
                        rows={3}
                        value={submitForm.notes}
                        onChange={(e) => setSubmitForm({ ...submitForm, notes: e.target.value })}
                        placeholder="Mention required documents (e.g. Student ID Card photo, .edu email)..."
                        className="w-full rounded-xl border-2 border-black bg-background p-3 text-sm font-medium outline-none focus:border-primary"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary text-primary-foreground border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all font-bold text-xs uppercase py-3"
                    >
                      Submit Offer for Review
                    </Button>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
