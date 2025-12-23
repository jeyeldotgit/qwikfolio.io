import { useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { PortfolioActions } from "@/components/dashboard/PortfolioActions";
import { CompletionBadge } from "@/components/dashboard/CompletionBadge";
import { ProfileMenu } from "@/components/dashboard/ProfileMenu";
import { useAuthSession } from "@/hooks/useAuthSession";
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
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/useToast";
import { updatePortfolioPublishedStatus } from "@/services/portfolio/portfolioService";
import { getPortfolio } from "@/services/portfolio/portfolioService";
import { trackResumeDownload } from "@/services/analytics/analyticsService";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthSession();
  const { profile } = useProfile();
  const { isLoading, portfolioExists, stats, refetch } = useDashboard();
  const { toast } = useToast();
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [statusOverride, setStatusOverride] = useState<
    "draft" | "published" | null
  >(null);

  const handleCreatePortfolio = () => {
    navigate("/dashboard/builder");
  };

  const handleViewPortfolio = () => {
    const effectiveStatus = statusOverride ?? stats?.status;
    if (effectiveStatus === "published" && profile?.username) {
      // Open public portfolio in new tab
      const publicUrl = `${window.location.origin}/${profile.username}`;
      window.open(publicUrl, "_blank");
    } else {
      // Show preview in dashboard
      navigate("/dashboard/preview");
    }
  };

  const handleEditPortfolio = () => {
    navigate("/dashboard/builder");
  };

  const handleEditProfile = () => {
    navigate("/onboarding");
  };

  const handleLogout = async () => {
    await signOut();
    toast({
      variant: "success",
      title: "Signed out",
      description: "You've been signed out successfully.",
    });
    navigate("/auth");
  };

  const handleDownloadResume = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not authenticated",
        description: "Please sign in to download your resume.",
      });
      return;
    }

    try {
      // Fetch portfolio data to verify it exists
      const portfolio = await getPortfolio(user.id);

      if (!portfolio) {
        toast({
          variant: "destructive",
          title: "No portfolio found",
          description: "Please create a portfolio first.",
        });
        return;
      }

      // Track download (will also be tracked in preview page, but that's okay - we can dedupe later)
      await trackResumeDownload(user.id);

      // Refetch stats to update the count
      await refetch();

      // Navigate to preview page with print flag
      navigate("/dashboard/preview?print=true");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to download resume",
        description:
          err instanceof Error ? err.message : "Unable to generate resume.",
      });
    }
  };

  const handleTogglePublishClick = () => {
    setIsPublishDialogOpen(true);
  };

  const handleConfirmTogglePublish = async () => {
    if (!stats || !user) return;
    const currentStatus = statusOverride ?? stats.status;
    const nextStatus: "draft" | "published" =
      currentStatus === "published" ? "draft" : "published";

    try {
      await updatePortfolioPublishedStatus(user.id, nextStatus === "published");
      setStatusOverride(null); // Clear override to use fresh data
      await refetch(); // Refetch to get updated status
      setIsPublishDialogOpen(false);
      toast({
        variant: "success",
        title:
          nextStatus === "published"
            ? "Portfolio published!"
            : "Portfolio unpublished",
        description:
          nextStatus === "published"
            ? "Your portfolio is now live and accessible to everyone."
            : "Your portfolio is now private.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to update status",
        description:
          err instanceof Error
            ? err.message
            : "Unable to update portfolio status.",
      });
    }
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
            <ProfileMenu
              displayName={profile?.full_name ?? user?.email ?? null}
              onEditProfile={handleEditProfile}
              onLogout={handleLogout}
            />
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
          <div className="flex items-center gap-4">
            <CompletionBadge status={effectiveStatus} />
            <ProfileMenu
              displayName={profile?.full_name ?? user?.email ?? null}
              onEditProfile={handleEditProfile}
              onLogout={handleLogout}
            />
          </div>
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
        {effectiveStatus === "published" && profile?.username ? (
          <div className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-[11px] text-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
            <p className="mb-1 font-medium">Public URL</p>
            <p className="font-mono text-xs break-all">
              {window.location.origin}/{profile.username}
            </p>
            <button
              type="button"
              onClick={() => {
                const url = `${window.location.origin}/${profile.username}`;
                navigator.clipboard.writeText(url);
                toast({
                  variant: "success",
                  title: "URL copied!",
                  description: "Portfolio URL has been copied to clipboard.",
                });
              }}
              className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Copy URL
            </button>
          </div>
        ) : null}
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
