import { Link } from "react-router-dom";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import type { Portfolio } from "@/schemas/portfolio";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

type CompletionBadgeProps = {
  portfolio: Portfolio | null;
  className?: string;
  showLink?: boolean;
};

export const CompletionBadge = ({
  portfolio,
  className,
  showLink = true,
}: CompletionBadgeProps) => {
  const completion = useProfileCompletion(portfolio);

  const getCompletionColor = () => {
    if (completion.percentage >= 100) return "text-emerald-600 dark:text-emerald-400";
    if (completion.percentage >= 70) return "text-blue-600 dark:text-blue-400";
    if (completion.percentage >= 50) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const content = (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900/50",
        className
      )}
    >
      {completion.percentage === 100 ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <Circle className="h-4 w-4 text-slate-400" />
      )}
      <div className="flex items-center gap-2">
        <span className={cn("text-sm font-medium", getCompletionColor())}>
          {completion.percentage}% Complete
        </span>
        {completion.percentage < 100 && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            ({completion.requiredCompleted}/{completion.requiredTotal} required)
          </span>
        )}
      </div>
    </div>
  );

  if (showLink && completion.percentage < 100) {
    return (
      <Link to="/dashboard/builder" className="block">
        {content}
      </Link>
    );
  }

  return content;
};
