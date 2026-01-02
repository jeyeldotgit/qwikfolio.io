import { Card, CardContent } from "@/components/ui/card";
import { Eye, FileDown, CheckCircle2 } from "lucide-react";

type StatsCardsProps = {
  totalViews: number;
  resumeDownloads: number;
  status: "draft" | "published";
};

export const StatsCards = ({
  totalViews,
  resumeDownloads,
  status,
}: StatsCardsProps) => {
  const statusLabel = status === "published" ? "Published" : "Draft";

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Views</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
              {totalViews}
            </p>
          </div>
          <Eye className="h-5 w-5 text-emerald-500" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Resume Downloads
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
              {resumeDownloads}
            </p>
          </div>
          <FileDown className="h-5 w-5 text-cyan-500" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
            <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {statusLabel}
            </p>
          </div>
          <CheckCircle2
            className={`h-5 w-5 ${
              status === "published" ? "text-emerald-500" : "text-amber-500"
            }`}
          />
        </CardContent>
      </Card>
    </div>
  );
};


