import { Navigation } from "@/components/layout/Navigation";
import { Hero } from "@/components/landing/Hero";
import { BentoGrid, BentoCard } from "@/components/landing/BentoGrid";
import { Button } from "@/components/retroui/Button";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/auth/user";
import {
  FileText,
  Rocket,
  Trophy,
  Briefcase,
  Users,
  Layers,
  Lightbulb,
  Globe,
  ArrowRight,
} from "lucide-react";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    await getOrCreateUser();
  }

  const features = [
    {
      Icon: FileText,
      name: "Peer-Curated Research",
      description:
        "Three-tier moderation system ensuring top-tier quality. Automated vetting, club review, and community voting.",
      href: "/explore",
      cta: "Read Research",
      className: "md:col-span-2",
      background: (
        <div className="absolute right-0 top-0 h-[300px] w-[600px] opacity-10 [mask-image:linear-gradient(to_bottom,white,transparent)] bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]" />
      ),
    },
    {
      Icon: Rocket,
      name: "Quest System",
      description:
        "Turn 'What If' ideas into collaborative projects. Build with peers.",
      href: "/quests",
      cta: "Start a Quest",
      className: "md:col-span-1",
      background: (
        <div className="absolute right-0 top-0 h-[200px] w-[200px] opacity-10 bg-gradient-to-tr from-orange-400 to-red-500 blur-3xl rounded-full" />
      ),
    },
    {
      Icon: Trophy,
      name: "Gamification",
      description: "Earn points, unlock badges, and climb the leaderboard.",
      href: "/leaderboard",
      cta: "View Leaderboard",
      className: "md:col-span-1",
      background: (
        <div className="absolute -right-10 -top-10 h-[300px] w-[300px] opacity-5 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      ),
    },
    {
      Icon: Briefcase,
      name: "Portfolio Export",
      description:
        "One-click PDF with your top projects and verified badges. Perfect for job applications.",
      href: "/profile",
      cta: "Build Portfolio",
      className: "md:col-span-2",
      background: (
        <div className="absolute right-0 bottom-0 h-[300px] w-[600px] opacity-5 [mask-image:linear-gradient(to_top,white,transparent)] bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]" />
      ),
    },
  ];

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background text-foreground">
        <Hero />

        {/* Features Grid - Bento Style */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="font-head text-4xl lg:text-6xl font-bold mb-4">
              Why{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                SPARK
              </span>
              ?
            </h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              Everything you need to accelerate your engineering journey.
            </p>
          </div>

          <BentoGrid className="max-w-6xl mx-auto">
            {features.map((feature, idx) => (
              <BentoCard key={idx} {...feature} />
            ))}
          </BentoGrid>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 py-24 mb-16">
          <div className="bg-card text-card-foreground border-2 border-brutal rounded-3xl p-12 md:p-16 relative overflow-hidden shadow-brutal">
            <div className="absolute top-0 right-0 p-32 bg-primary/10 rounded-full blur-3xl opacity-20"></div>
            <div className="absolute bottom-0 left-0 p-32 bg-primary/10 rounded-full blur-3xl opacity-20"></div>

            <div className="relative z-10 text-center mb-16">
              <h2 className="font-head text-3xl md:text-5xl font-bold mb-4">
                Join the Movement
              </h2>
              <p className="text-muted-foreground text-lg">
                Growing faster every day.
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-border">
              <div className="pt-8 md:pt-0">
                <div className="flex justify-center mb-4 text-orange-500">
                  <Users size={32} />
                </div>
                <div className="text-5xl md:text-6xl font-head font-bold mb-2">
                  500+
                </div>
                <p className="text-muted-foreground">Engineering Students</p>
              </div>
              <div className="pt-8 md:pt-0 pl-0 md:pl-8">
                <div className="flex justify-center mb-4 text-blue-500">
                  <Layers size={32} />
                </div>
                <div className="text-5xl md:text-6xl font-head font-bold mb-2">
                  200+
                </div>
                <p className="text-muted-foreground">Research Posts</p>
              </div>
              <div className="pt-8 md:pt-0 pl-0 md:pl-8">
                <div className="flex justify-center mb-4 text-green-500">
                  <Lightbulb size={32} />
                </div>
                <div className="text-5xl md:text-6xl font-head font-bold mb-2">
                  50+
                </div>
                <p className="text-muted-foreground">Collaborative Quests</p>
              </div>
            </div>
          </div>
        </section>


        {/* Footer */}
        <footer className="border-t border-border bg-card py-12">
          <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 font-head font-bold text-xl">
              <Globe className="h-5 w-5" /> SPARK
            </div>
            <p className="text-neutral-500 text-sm">
              © {new Date().getFullYear()} ITM RnD Club. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm font-medium text-neutral-600">
              <a href="#" className="hover:text-black transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-black transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-black transition-colors">
                Contact
              </a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
