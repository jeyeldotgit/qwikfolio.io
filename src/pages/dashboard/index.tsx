import { useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { PortfolioActions } from "@/components/dashboard/PortfolioActions";
import { CompletionBadge } from "@/components/dashboard/CompletionBadge";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { isLoading, portfolioExists, stats } = useDashboard();
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [statusOverride, setStatusOverride] = useState<
    "draft" | "published" | null
  >(null);
  // TODO: replace with authenticated user handle / portfolio slug
  const devName = "alex-dev";

  const handleCreatePortfolio = () => {
    navigate("/dashboard/builder");
  };

  const handleViewPortfolio = () => {
    navigate("/dashboard/preview");
  };

  const handleEditPortfolio = () => {
    console.log("Edit portfolio clicked");
    navigate("/dashboard/builder");
  };

  const handleDownloadResume = () => {
    console.log("Download resume clicked");
  };

  const handleTogglePublishClick = () => {
    setIsPublishDialogOpen(true);
  };

  const handleConfirmTogglePublish = () => {
    if (!stats) return;
    const currentStatus = statusOverride ?? stats.status;
    const nextStatus: "draft" | "published" =
      currentStatus === "published" ? "draft" : "published";

    console.log(
      `Portfolio ${nextStatus === "published" ? "published" : "unpublished"}`
    );

    setStatusOverride(nextStatus);
    setIsPublishDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-8 w-8 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!portfolioExists || !stats) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <button
              type="button"
              className="flex items-center space-x-2"
              onClick={() => navigate("/")}
            >
              <Zap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <span className="text-lg font-semibold text-slate-900 dark:text-white">
                QwikFolio.io
              </span>
            </button>
          </div>
        </header>
        <main>
          <EmptyState onCreatePortfolio={handleCreatePortfolio} />
        </main>
      </div>
    );
  }

  const effectiveStatus = statusOverride ?? stats.status;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            type="button"
            className="flex items-center space-x-2"
            onClick={() => navigate("/")}
          >
            <Zap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <span className="text-lg font-semibold text-slate-900 dark:text-white">
              QwikFolio.io
            </span>
          </button>
          <CompletionBadge status={effectiveStatus} />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
            Your Portfolio Overview
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
            You&apos;ve shipped your QwikFolio. Here&apos;s how it&apos;s
            performing and what you can do next.
          </p>
        </section>

        <section>
          <StatsCards
            totalViews={stats.totalViews}
            resumeDownloads={stats.resumeDownloads}
            status={effectiveStatus}
          />
        </section>

        <section>
          <PortfolioActions
            onViewPortfolio={handleViewPortfolio}
            onEditPortfolio={handleEditPortfolio}
            onDownloadResume={handleDownloadResume}
            onTogglePublish={handleTogglePublishClick}
            status={effectiveStatus}
          />
        </section>
      </main>

      <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
        <DialogHeader>
          <DialogTitle>
            {effectiveStatus === "published"
              ? "Unpublish portfolio"
              : "Publish portfolio"}
          </DialogTitle>
          <DialogDescription>
            {effectiveStatus === "published"
              ? "Unpublishing will hide your public portfolio link. You can publish again anytime."
              : "Publishing will make your portfolio accessible via a public link. You can unpublish at any time."}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-[11px] text-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
          <p className="mb-1 font-medium">Public URL</p>
          <p className="font-mono text-xs">/qwikfolio.io/{devName}</p>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPublishDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            variant={
              effectiveStatus === "published" ? "destructive" : "default"
            }
            onClick={handleConfirmTogglePublish}
          >
            {effectiveStatus === "published" ? "Unpublish" : "Publish"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default DashboardPage;
