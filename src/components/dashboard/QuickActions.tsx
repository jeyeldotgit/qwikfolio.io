import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowUpRight,
  Edit3,
  FileDown,
  Globe2,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";

type QuickActionsProps = {
  onViewPortfolio: () => void;
  onEditPortfolio: () => void;
  onDownloadResume: () => void;
  onTogglePublish: () => void;
  onCopyLink?: () => void;
  status: "draft" | "published";
  publicUrl?: string;
};

export const QuickActions = ({
  onViewPortfolio,
  onEditPortfolio,
  onDownloadResume,
  onTogglePublish,
  onCopyLink,
  status,
  publicUrl,
}: QuickActionsProps) => {
  const [copied, setCopied] = useState(false);
  const isPublished = status === "published";

  const handleCopyLink = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      onCopyLink?.();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-slate-900 dark:text-white">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Primary Action */}
        <Button
          className="w-full justify-between bg-emerald-600 text-white hover:bg-emerald-500"
          onClick={onViewPortfolio}
        >
          <span className="flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4" />
            View Portfolio
          </span>
          {isPublished && (
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium">
              LIVE
            </span>
          )}
        </Button>

        {/* Secondary Actions Grid */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="justify-start"
            onClick={onEditPortfolio}
          >
            <Edit3 className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={onDownloadResume}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Resume
          </Button>
        </div>

        {/* Publish/Share Section */}
        <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe2
                className={`h-4 w-4 ${isPublished ? "text-emerald-500" : "text-slate-400"}`}
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {isPublished ? "Published" : "Draft"}
              </span>
            </div>
            <Button
              size="sm"
              variant={isPublished ? "outline" : "default"}
              className={
                isPublished
                  ? "h-7 text-xs"
                  : "h-7 bg-emerald-600 text-xs text-white hover:bg-emerald-500"
              }
              onClick={onTogglePublish}
            >
              {isPublished ? "Unpublish" : "Publish"}
            </Button>
          </div>

          {isPublished && publicUrl && (
            <div className="flex items-center gap-2">
              <div className="flex-1 overflow-hidden rounded-md bg-white px-2.5 py-1.5 dark:bg-slate-900">
                <p className="truncate font-mono text-xs text-slate-600 dark:text-slate-300">
                  {publicUrl}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ url: publicUrl });
                  } else {
                    handleCopyLink();
                  }
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

