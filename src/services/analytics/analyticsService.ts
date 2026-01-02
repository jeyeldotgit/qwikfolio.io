import supabase from "@/lib/supabase";

class AnalyticsServiceError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "AnalyticsServiceError";
    this.code = code;
  }
}

export const trackPortfolioView = async (userId: string): Promise<void> => {
  try {
    // Use RPC function to bypass RLS for public views
    const { error } = await supabase.rpc("track_portfolio_view", {
      target_user_id: userId,
    });

    if (error) {
      // Fallback: try direct insert if RPC fails
      const { error: insertError } = await supabase
        .from("portfolio_analytics")
        .insert({
          user_id: userId,
          event_type: "view",
        });

      if (insertError) {
        console.error("Failed to track view:", insertError);
        // Don't throw - analytics failures shouldn't break the app
      }
    }
  } catch (error) {
    console.error("Error tracking portfolio view:", error);
    // Don't throw - analytics failures shouldn't break the app
  }
};

export const trackResumeDownload = async (userId: string): Promise<void> => {
  try {
    // Use RPC function to bypass RLS
    const { error } = await supabase.rpc("track_portfolio_download", {
      target_user_id: userId,
    });

    if (error) {
      // Fallback: try direct insert if RPC fails
      const { error: insertError } = await supabase
        .from("portfolio_analytics")
        .insert({
          user_id: userId,
          event_type: "download",
        });

      if (insertError) {
        console.error("Failed to track download:", insertError);
        // Don't throw - analytics failures shouldn't break the app
      }
    }
  } catch (error) {
    console.error("Error tracking resume download:", error);
    // Don't throw - analytics failures shouldn't break the app
  }
};

export type AnalyticsDataPoint = {
  date: string;
  views: number;
  downloads: number;
};

export type RecentActivityItem = {
  id: string;
  type: "view" | "download";
  timestamp: string;
};

export const getAnalyticsTimeSeries = async (
  userId: string,
  days: number = 7
): Promise<AnalyticsDataPoint[]> => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("portfolio_analytics")
      .select("event_type, created_at")
      .eq("user_id", userId)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to fetch time series:", error);
      return generateEmptyTimeSeries(days);
    }

    // Group by date
    const dateMap = new Map<string, { views: number; downloads: number }>();

    // Initialize all dates with zeros
    for (let i = 0; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      const dateKey = date.toISOString().split("T")[0];
      dateMap.set(dateKey, { views: 0, downloads: 0 });
    }

    // Aggregate events by date
    data?.forEach((event) => {
      const dateKey = event.created_at.split("T")[0];
      const existing = dateMap.get(dateKey) || { views: 0, downloads: 0 };
      if (event.event_type === "view") {
        existing.views += 1;
      } else if (event.event_type === "download") {
        existing.downloads += 1;
      }
      dateMap.set(dateKey, existing);
    });

    // Convert to array
    return Array.from(dateMap.entries()).map(([date, counts]) => ({
      date,
      views: counts.views,
      downloads: counts.downloads,
    }));
  } catch (error) {
    console.error("Error fetching analytics time series:", error);
    return generateEmptyTimeSeries(days);
  }
};

const generateEmptyTimeSeries = (days: number): AnalyticsDataPoint[] => {
  const result: AnalyticsDataPoint[] = [];
  for (let i = 0; i <= days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    result.push({
      date: date.toISOString().split("T")[0],
      views: 0,
      downloads: 0,
    });
  }
  return result;
};

export const getRecentActivity = async (
  userId: string,
  limit: number = 10
): Promise<RecentActivityItem[]> => {
  try {
    const { data, error } = await supabase
      .from("portfolio_analytics")
      .select("id, event_type, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Failed to fetch recent activity:", error);
      return [];
    }

    return (
      data?.map((event) => ({
        id: event.id,
        type: event.event_type as "view" | "download",
        timestamp: event.created_at,
      })) || []
    );
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return [];
  }
};

export const getPortfolioStats = async (
  userId: string
): Promise<{
  totalViews: number;
  resumeDownloads: number;
  lastViewed: string | null;
}> => {
  try {
    // Get total views
    const { count: viewCount, error: viewError } = await supabase
      .from("portfolio_analytics")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("event_type", "view");

    if (viewError) {
      throw new AnalyticsServiceError(
        `Failed to fetch view count: ${viewError.message}`,
        viewError.code
      );
    }

    // Get total downloads
    const { count: downloadCount, error: downloadError } = await supabase
      .from("portfolio_analytics")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("event_type", "download");

    if (downloadError) {
      throw new AnalyticsServiceError(
        `Failed to fetch download count: ${downloadError.message}`,
        downloadError.code
      );
    }

    // Get last view timestamp
    const { data: lastView, error: lastViewError } = await supabase
      .from("portfolio_analytics")
      .select("created_at")
      .eq("user_id", userId)
      .eq("event_type", "view")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (lastViewError && lastViewError.code !== "PGRST116") {
      // PGRST116 is "not found" - that's okay
      throw new AnalyticsServiceError(
        `Failed to fetch last view: ${lastViewError.message}`,
        lastViewError.code
      );
    }

    return {
      totalViews: viewCount || 0,
      resumeDownloads: downloadCount || 0,
      lastViewed: lastView?.created_at || null,
    };
  } catch (error) {
    if (error instanceof AnalyticsServiceError) {
      throw error;
    }
    throw new AnalyticsServiceError(
      `Unexpected error fetching stats: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
