import { useState, useEffect } from "react";
import { useAuthSession } from "./useAuthSession";
import { getPortfolio } from "@/services/portfolio/portfolioService";
import { getPortfolioStats } from "@/services/analytics/analyticsService";
import supabase from "@/lib/supabase";

type PortfolioStatus = "draft" | "published";

type DashboardStats = {
  totalViews: number;
  resumeDownloads: number;
  lastViewed: string | null;
  status: PortfolioStatus;
};

type DashboardState = "idle" | "loading" | "success" | "error";

type UseDashboardResult = {
  state: DashboardState;
  isLoading: boolean;
  portfolioExists: boolean;
  stats: DashboardStats | null;
  error: string | null;
  refetch: () => Promise<void>;
};

export const useDashboard = (): UseDashboardResult => {
  const { user } = useAuthSession();
  const [state, setState] = useState<DashboardState>("idle");
  const [portfolioExists, setPortfolioExists] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = async () => {
    if (!user) {
      setState("idle");
      setPortfolioExists(false);
      setStats(null);
      setError(null);
      return;
    }

    setState("loading");
    setError(null);

    try {
      const portfolio = await getPortfolio(user.id);

      if (portfolio) {
        // Fetch published status from database
        const { data: portfolioData } = await supabase
          .from("portfolios")
          .select("published")
          .eq("user_id", user.id)
          .single();

        // Fetch analytics stats
        const analyticsStats = await getPortfolioStats(user.id);

        setPortfolioExists(true);
        setStats({
          totalViews: analyticsStats.totalViews,
          resumeDownloads: analyticsStats.resumeDownloads,
          lastViewed: analyticsStats.lastViewed,
          status: portfolioData?.published ? "published" : "draft",
        });
        setState("success");
      } else {
        setPortfolioExists(false);
        setStats(null);
        setState("success");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch portfolio";
      setError(errorMessage);
      setState("error");
      setPortfolioExists(false);
      setStats(null);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [user]);

  return {
    state,
    isLoading: state === "loading",
    portfolioExists,
    stats,
    error,
    refetch: fetchPortfolio,
  };
};
