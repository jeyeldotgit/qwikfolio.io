type Stat = {
  value: string;
  label: string;
  suffix?: string;
};

const STATS: Stat[] = [
  { value: "2,500", label: "Portfolios Created", suffix: "+" },
  { value: "10,000", label: "Resumes Downloaded", suffix: "+" },
  { value: "98", label: "User Satisfaction", suffix: "%" },
  { value: "5", label: "Minutes to Build", suffix: "min" },
];

export const StatsSection = () => {
  return (
    <section className="py-16 border-y border-slate-200 dark:border-slate-800">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                {stat.value}
                {stat.suffix && (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {stat.suffix}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
