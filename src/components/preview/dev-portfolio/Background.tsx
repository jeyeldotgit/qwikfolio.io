export const DevPortfolioBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 opacity-70 sm:opacity-100 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] dark:bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)]" />
      <div className="hidden sm:block absolute top-0 left-1/4 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl dark:bg-emerald-500/10" />
      <div className="hidden sm:block absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-cyan-500/5 blur-3xl dark:bg-cyan-500/10" />
    </div>
  );
};


