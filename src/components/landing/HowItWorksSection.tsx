import { UserPlus, PenLine, Rocket } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Step = {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

const STEPS: Step[] = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Your Account",
    description:
      "Sign up in seconds with email. No credit card, no commitments.",
  },
  {
    number: "02",
    icon: PenLine,
    title: "Fill Out Your Info",
    description:
      "Add your experience, projects, skills, and education through simple forms.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Share & Download",
    description:
      "Publish your portfolio with a custom link and download your resume as PDF.",
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-3">
            HOW IT WORKS
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Three Steps to Your Portfolio
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            From zero to a published portfolio in under 10 minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {STEPS.map((step, idx) => (
              <div key={step.number} className="relative">
                {/* Mobile Connector */}
                {idx < STEPS.length - 1 && (
                  <div className="lg:hidden absolute left-6 top-16 bottom-0 w-px bg-gradient-to-b from-emerald-500/30 to-transparent -mb-8" />
                )}

                <div className="flex lg:flex-col items-start lg:items-center lg:text-center gap-4">
                  {/* Number Badge */}
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20" />
                    <div className="relative h-12 w-12 rounded-xl bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">{step.number}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="lg:mt-6">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 mb-3 lg:mx-auto">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

