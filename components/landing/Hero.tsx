import Link from "next/link";
import { Button } from "@/components/retroui/Button";
import { Badge } from "@/components/retroui/Badge";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 md:pt-24 pb-32">
      <div className="container relative z-10 mx-auto px-4 text-center">
        <div className="mx-auto max-w-4xl">
          <Badge className="mb-6 inline-flex items-center gap-2 bg-yellow-300 text-black border-2 border-brutal shadow-brutal px-4 py-2 text-sm font-bold uppercase tracking-wider transform -rotate-2 hover:rotate-0 transition-transform">
            <Sparkles className="h-4 w-4" />
            Beta Launch • Join the Revolution
          </Badge>

          <h1 className="font-head text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-foreground mb-8 leading-[1.1]">
            Ignite Ideas. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 relative inline-block px-2 pb-2">
              Build Together.
              <svg
                className="absolute w-full h-4 -bottom-2 left-0 text-foreground opacity-20"
                viewBox="0 0 100 10"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 5 Q 50 10 100 5 L 100 0 Q 50 5 0 0 Z"
                  fill="currentColor"
                />
              </svg>
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed font-medium">
            The{" "}
            <span className="font-bold underline decoration-wavy decoration-orange-400 text-foreground">
              ONLY
            </span>{" "}
            platform combining peer-curated research, authentic storytelling,
            and verifiable portfolios—built for the next generation of
            engineers.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/explore">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground border-2 border-brutal shadow-[6px_6px_0px_0px_rgba(128,128,128,0.5)] hover:shadow-[2px_2px_0px_0px_rgba(128,128,128,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-lg px-8 py-6 h-auto font-head"
              >
                Start Building <Zap className="ml-2 w-5 h-5 inline-block" />
              </Button>
            </Link>
            <Link href="/explore">
              <Button
                variant="outline"
                size="lg"
                className="bg-card text-card-foreground border-2 border-brutal shadow-brutal hover:shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-lg px-8 py-6 h-auto font-head group"
              >
                Explore Projects
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Social Proof / Stats Ticker placeholder */}
          <div className="mt-16 pt-8 border-t-2 border-border/10 flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all">
            {/* Could add logos or stats here */}
          </div>
        </div>
      </div>

      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 z-0 bg-foreground/5"
        style={{
          maskImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          WebkitMaskImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
    </section>
  );
}
