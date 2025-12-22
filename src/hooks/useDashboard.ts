type PortfolioStatus = "draft" | "published";

type DashboardStats = {
  totalViews: number;
  resumeDownloads: number;
  lastViewed: string | null;
  status: PortfolioStatus;
};

type UseDashboardResult = {
  isLoading: boolean;
  portfolioExists: boolean;
  stats: DashboardStats | null;
};

export const useDashboard = (): UseDashboardResult => {
  // For MVP we mock portfolio presence + stats.
  // Later this will be replaced with a real API or persisted state.
  const portfolioExists = true;

  if (!portfolioExists) {
    return {
      isLoading: false,
      portfolioExists: false,
      stats: null,
    };
  }

  const stats: DashboardStats = {
    totalViews: 124,
    resumeDownloads: 18,
    lastViewed: "2025-01-04T15:32:00.000Z",
    status: "published",
  };

  return {
    isLoading: false,
    portfolioExists: true,
    stats,
  };
};
