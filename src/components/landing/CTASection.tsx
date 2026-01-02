import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-500 to-cyan-500" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 text-center">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white/20 backdrop-blur mb-6">
          <Zap className="h-7 w-7 text-white" />
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          Ready to Ship Your Portfolio?
        </h2>

        <p className="text-lg sm:text-xl text-emerald-100 max-w-2xl mx-auto mb-10">
          Join thousands of developers who've already created their professional
          portfolio with QwikFolio. It's free to get started.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            size="lg"
            className="bg-white text-emerald-600 hover:bg-white/90 px-8 h-12 text-base font-semibold shadow-lg shadow-black/10 hover:shadow-xl transition-all"
            onClick={() => navigate("/auth")}
          >
            Get Started for Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-white/30 text-white hover:bg-white/10 px-8 h-12 text-base"
            onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
          >
            Contact Us
          </Button>
        </div>
      </div>
    </section>
  );
};

