import { FileText, Eye, Download, Globe, Palette, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    icon: FileText,
    title: "Form-Based Builder",
    description:
      "No design skills needed. Just fill out structured forms with your info, and we handle the rest.",
  },
  {
    icon: Eye,
    title: "Live Preview",
    description:
      "See your portfolio update in real-time as you type. What you see is what you get.",
  },
  {
    icon: Download,
    title: "One-Click PDF",
    description:
      "Export a print-ready resume instantly. Perfect for job applications and interviews.",
  },
  {
    icon: Globe,
    title: "Public Portfolio",
    description:
      "Get a shareable link to your portfolio. Send it to recruiters or add it to LinkedIn.",
  },
  {
    icon: Palette,
    title: "Modern Design",
    description:
      "Clean, professional templates that make you stand out. Dark mode included.",
  },
  {
    icon: Shield,
    title: "You Own Your Data",
    description:
      "Your information stays yours. Export, update, or delete anytime you want.",
  },
];

const FeatureCard = ({ icon: Icon, title, description }: Feature) => (
  <div className="group relative p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300">
    {/* Hover gradient */}
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

    <div className="relative">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>

    {/* Bottom accent line */}
    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  </div>
);

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-3">
            FEATURES
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Everything You Need to Shine
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            QwikFolio handles the design and layout, so you can focus on showcasing
            your skills and experience.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

