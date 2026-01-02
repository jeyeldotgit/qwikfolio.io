import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)]" />
        <div className="absolute top-20 left-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-40 right-1/4 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 px-4 py-1.5 mb-8">
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Build your portfolio in minutes
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight">
            <span className="text-slate-900 dark:text-white">Your Career,</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
              One Page Away
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Stop wrestling with design tools. Fill out simple forms, and we'll
            generate a stunning portfolio and print-ready resume instantly.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 h-12 text-base shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
              onClick={() => navigate("/auth")}
            >
              Start Building — It's Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-8 h-12 text-base"
              onClick={scrollToFeatures}
            >
              See How It Works
            </Button>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <span>
              Join{" "}
              <strong className="text-slate-700 dark:text-slate-300">
                developers
              </strong>{" "}
              who've shipped their portfolios
            </span>
          </div>
        </div>

        {/* Hero Visual - Portfolio Preview Mockup */}
        <div className="mt-16 lg:mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent dark:from-slate-950 pointer-events-none z-10" />
          <div className="relative mx-auto max-w-4xl">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center px-3">
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                      qwikfolio.io/alex-dev
                    </span>
                  </div>
                </div>
              </div>
              {/* Portfolio Preview Content */}
              <div className="p-8 bg-slate-950">
                <div className="flex items-start gap-6">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white">
                    A
                  </div>
                  <div className="space-y-2">
                    <p className="text-emerald-400 font-mono text-sm">
                      {"<hello world />"}
                    </p>
                    <h3 className="text-2xl font-bold text-white">
                      Alex Developer
                    </h3>
                    <p className="text-slate-400">Full-Stack Engineer</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["React", "TypeScript", "Node.js", "PostgreSQL"].map(
                    (tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 rounded-lg border border-slate-700 bg-slate-800 text-sm text-slate-300"
                      >
                        {tech}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
