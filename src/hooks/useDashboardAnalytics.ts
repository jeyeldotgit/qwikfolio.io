import { useState, useEffect, useCallback } from "react";
import { useAuthSession } from "./useAuthSession";
import {
  getAnalyticsTimeSeries,
  getRecentActivity,
  type AnalyticsDataPoint,
  type RecentActivityItem,
} from "@/services/analytics/analyticsService";

type UseDashboardAnalyticsResult = {
  chartData: AnalyticsDataPoint[];
  recentActivity: RecentActivityItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export const useDashboardAnalytics = (): UseDashboardAnalyticsResult => {
  const { user } = useAuthSession();
  const [chartData, setChartData] = useState<AnalyticsDataPoint[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [timeSeriesData, activityData] = await Promise.all([
        getAnalyticsTimeSeries(user.id, 7),
        getRecentActivity(user.id, 10),
      ]);

      setChartData(timeSeriesData);
      setRecentActivity(activityData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch analytics";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    chartData,
    recentActivity,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
};

