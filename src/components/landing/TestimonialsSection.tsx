import { Quote } from "lucide-react";

type Testimonial = {
  name: string;
  role: string;
  quote: string;
  avatar: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Jenascia R.",
    role: "Student",
    quote:
      "QwikFolio made it so easy to create my first professional portfolio. I went from having nothing to a polished site in under 10 minutes. It really helped me stand out during my internship applications!",
    avatar: "JR",
  },
  {
    name: "Christopher N.",
    role: "Student",
    quote:
      "I was dreading the whole portfolio creation process, but this tool changed everything. The templates are clean, modern, and I didn't have to write a single line of code. Highly recommend!",
    avatar: "CN",
  },
  {
    name: "Rodel L.",
    role: "Student",
    quote:
      "As someone who's not very tech-savvy, I appreciated how intuitive everything was. The step-by-step builder walked me through each section, and now I have a portfolio I'm actually proud to share.",
    avatar: "RL",
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-br from-emerald-100/50 to-cyan-100/50 blur-3xl dark:from-emerald-900/20 dark:to-cyan-900/20" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-3">
            TESTIMONIALS
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            What Users Have to Say About QwikFolio
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Join developers, professionals, and aspiring developers who have
            transformed their online presence with QwikFolio.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <article
              key={testimonial.name}
              className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Quote icon */}
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-cyan-100 dark:from-emerald-900/30 dark:to-cyan-900/30">
                <Quote className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>

              {/* Quote text */}
              <blockquote className="mb-6 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-sm font-semibold text-white">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>

              {/* Decorative gradient line */}
              <div className="absolute bottom-0 left-0 h-1 w-0 rounded-b-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300 group-hover:w-full" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
