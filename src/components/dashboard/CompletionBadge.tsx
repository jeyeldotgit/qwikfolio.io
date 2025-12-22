type CompletionBadgeProps = {
  status: "draft" | "published";
};

export const CompletionBadge = ({ status }: CompletionBadgeProps) => {
  if (status === "published") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
        Live and shareable
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-950/30 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
      Draft — publish to share
    </span>
  );
};


