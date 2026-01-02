import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileDown, Clock } from "lucide-react";
import type { RecentActivityItem } from "@/services/analytics/analyticsService";

type RecentActivityProps = {
  activities: RecentActivityItem[];
  isLoading?: boolean;
};

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const RecentActivity = ({
  activities,
  isLoading,
}: RecentActivityProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-2 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-medium text-slate-900 dark:text-white">
          <Clock className="h-4 w-4 text-slate-400" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3 transition-colors hover:bg-slate-100/50 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    activity.type === "view"
                      ? "bg-emerald-100 dark:bg-emerald-900/30"
                      : "bg-cyan-100 dark:bg-cyan-900/30"
                  }`}
                >
                  {activity.type === "view" ? (
                    <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <FileDown className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {activity.type === "view"
                      ? "Portfolio viewed"
                      : "Resume downloaded"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Clock className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              No recent activity
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Activity will appear here as visitors interact with your portfolio
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

