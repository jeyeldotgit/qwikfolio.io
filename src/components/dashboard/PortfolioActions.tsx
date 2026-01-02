import { Button } from "@/components/ui/button";
import { ArrowUpRight, Edit3, FileDown, Globe2 } from "lucide-react";

type PortfolioActionsProps = {
  onViewPortfolio: () => void;
  onEditPortfolio: () => void;
  onDownloadResume: () => void;
  onTogglePublish: () => void;
  status: "draft" | "published";
};

export const PortfolioActions = ({
  onViewPortfolio,
  onEditPortfolio,
  onDownloadResume,
  onTogglePublish,
  status,
}: PortfolioActionsProps) => {
  const isPublished = status === "published";

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Portfolio actions
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          className="flex-1 justify-center h-10 text-sm bg-emerald-600 hover:bg-emerald-500 text-white"
          onClick={onViewPortfolio}
        >
          View Portfolio
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="flex-1 justify-center h-10 text-sm"
          onClick={onEditPortfolio}
        >
          <Edit3 className="mr-2 h-4 w-4" />
          Edit Portfolio
        </Button>
        <Button
          variant="outline"
          className="flex-1 justify-center h-10 text-sm"
          onClick={onDownloadResume}
        >
          <FileDown className="mr-2 h-4 w-4" />
          Download Resume
        </Button>
      </div>
      <div className="flex justify-start">
        <Button
          type="button"
          size="sm"
          variant={isPublished ? "outline" : "default"}
          className={
            isPublished
              ? "text-xs"
              : "text-xs bg-emerald-600 text-white hover:bg-emerald-700"
          }
          onClick={onTogglePublish}
        >
          <Globe2 className="mr-2 h-4 w-4" />
          {isPublished ? "Unpublish portfolio" : "Publish portfolio"}
        </Button>
      </div>
    </div>
  );
};
