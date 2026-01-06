import { useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatCard } from "@/components/dashboard/StatCard";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { CompletionBadge } from "@/components/dashboard/CompletionBadge";
import { ProfileMenu } from "@/components/dashboard/ProfileMenu";
import { EditProfileModal } from "@/components/dashboard/EditProfileModal";
import { useAuthSession } from "@/hooks/useAuthSession";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Zap, Eye, FileDown, CheckCircle2, Calendar } from "lucide-react";
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
  const {
    chartData,
    recentActivity,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
  } = useDashboardAnalytics();
  const { toast } = useToast();
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [statusOverride, setStatusOverride] = useState<
    "draft" | "published" | null
  >(null);

  const handleCreatePortfolio = () => {
    navigate("/dashboard/builder");
  };

  const handleViewPortfolio = () => {
    const effectiveStatus = statusOverride ?? stats?.status;
    if (effectiveStatus === "published" && profile?.username) {
      const publicUrl = `${window.location.origin}/${profile.username}`;
      window.open(publicUrl, "_blank");
    } else {
      navigate("/dashboard/preview");
    }
  };

  const handleEditPortfolio = () => {
    navigate("/dashboard/builder");
  };

  const handleEditProfile = () => {
    setIsEditProfileModalOpen(true);
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
      const portfolio = await getPortfolio(user.id);

      if (!portfolio) {
        toast({
          variant: "destructive",
          title: "No portfolio found",
          description: "Please create a portfolio first.",
        });
        return;
      }

      await trackResumeDownload(user.id);
      await refetch();
      await refetchAnalytics();
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
      setStatusOverride(null);
      await refetch();
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

  const handleCopyLink = () => {
    toast({
      variant: "success",
      title: "Link copied!",
      description: "Portfolio URL has been copied to clipboard.",
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 border-2 border-slate-300 border-t-emerald-500 dark:border-slate-700 rounded-full animate-spin" />
      </div>
    );
  }

  // Empty state - no portfolio
  if (!portfolioExists || !stats) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <button
              type="button"
              className="flex items-center space-x-2"
              onClick={() => navigate("/")}
            >
              <Zap className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <span className="text-lg font-semibold text-slate-900 dark:text-white">
                QwikFolio.io
              </span>
            </button>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <ProfileMenu
                displayName={profile?.full_name ?? user?.email ?? null}
                onEditProfile={handleEditProfile}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </header>
        <main>
          <EmptyState onCreatePortfolio={handleCreatePortfolio} />
        </main>

        <EditProfileModal
          open={isEditProfileModalOpen}
          onOpenChange={setIsEditProfileModalOpen}
        />
      </div>
    );
  }

  const effectiveStatus = statusOverride ?? stats.status;
  const publicUrl = profile?.username
    ? `${window.location.origin}/${profile.username}`
    : undefined;

  // Format last viewed
  const formatLastViewed = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            type="button"
            className="flex items-center space-x-2"
            onClick={() => navigate("/")}
          >
            <Zap className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            <span className="text-lg font-semibold text-slate-900 dark:text-white">
              QwikFolio.io
            </span>
          </button>
          <div className="flex items-center gap-3">
            <CompletionBadge status={effectiveStatus} />
            <ThemeToggle />
            <ProfileMenu
              displayName={profile?.full_name ?? user?.email ?? null}
              onEditProfile={handleEditProfile}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <section className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Welcome back
            {profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!
            👋
          </h1>
          <p className="mt-1 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Here's how your portfolio is performing
          </p>
        </section>

        {/* Stats Cards */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Views"
            value={stats.totalViews}
            icon={Eye}
            iconColor="text-emerald-500"
          />
          <StatCard
            title="Resume Downloads"
            value={stats.resumeDownloads}
            icon={FileDown}
            iconColor="text-cyan-500"
          />
          <StatCard
            title="Status"
            value={effectiveStatus === "published" ? "Published" : "Draft"}
            icon={CheckCircle2}
            iconColor={
              effectiveStatus === "published"
                ? "text-emerald-500"
                : "text-amber-500"
            }
            subtitle={
              effectiveStatus === "published"
                ? "Visible to everyone"
                : "Only you can see it"
            }
          />
          <StatCard
            title="Last Viewed"
            value={formatLastViewed(stats.lastViewed)}
            icon={Calendar}
            iconColor="text-violet-500"
          />
        </section>

        {/* Main Content Grid */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* Chart - Takes 2 columns */}
          <div className="lg:col-span-2">
            <AnalyticsChart data={chartData} isLoading={analyticsLoading} />
          </div>

          {/* Quick Actions - Takes 1 column */}
          <div>
            <QuickActions
              onViewPortfolio={handleViewPortfolio}
              onEditPortfolio={handleEditPortfolio}
              onDownloadResume={handleDownloadResume}
              onTogglePublish={handleTogglePublishClick}
              onCopyLink={handleCopyLink}
              status={effectiveStatus}
              publicUrl={publicUrl}
            />
          </div>

          {/* Recent Activity - Full width on mobile, 2 columns on desktop */}
          <div className="lg:col-span-2">
            <RecentActivity
              activities={recentActivity}
              isLoading={analyticsLoading}
            />
          </div>
        </section>
      </main>

      {/* Publish Dialog */}
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
              className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
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

      <EditProfileModal
        open={isEditProfileModalOpen}
        onOpenChange={setIsEditProfileModalOpen}
      />
    </div>
  );
};

export default DashboardPage;
