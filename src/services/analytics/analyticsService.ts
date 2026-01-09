import supabase from "@/lib/supabase";

class AnalyticsServiceError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "AnalyticsServiceError";
    this.code = code;
  }
}

/**
 * Track portfolio view by slug or userId
 */
export const trackPortfolioView = async (
  slug: string | null,
  userId: string
): Promise<void> => {
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
          slug: slug || null,
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

/**
 * Track contact form click
 */
export const trackContactClick = async (
  slug: string,
  type: string
): Promise<void> => {
  try {
    // Get user_id from slug
    const { data: portfolioData, error: portfolioError } = await supabase
      .from("portfolios")
      .select("user_id")
      .eq("slug", slug)
      .maybeSingle();

    if (portfolioError || !portfolioData?.user_id) {
      console.error("Failed to find portfolio for slug:", slug, portfolioError);
      return;
    }

    const { error } = await supabase.from("portfolio_analytics").insert({
      user_id: portfolioData.user_id,
      event_type: "contact_click",
      slug: slug,
      event_data: { type },
    });

    if (error) {
      console.error("Failed to track contact click:", error);
    }
  } catch (error) {
    console.error("Error tracking contact click:", error);
  }
};

/**
 * Track social link click
 */
export const trackSocialLinkClick = async (
  slug: string,
  type: string
): Promise<void> => {
  try {
    // Get user_id from slug
    const { data: portfolioData, error: portfolioError } = await supabase
      .from("portfolios")
      .select("user_id")
      .eq("slug", slug)
      .maybeSingle();

    if (portfolioError || !portfolioData?.user_id) {
      console.error("Failed to find portfolio for slug:", slug, portfolioError);
      return;
    }

    const { error } = await supabase.from("portfolio_analytics").insert({
      user_id: portfolioData.user_id,
      event_type: "social_click",
      slug: slug,
      event_data: { type },
    });

    if (error) {
      console.error("Failed to track social link click:", error);
    }
  } catch (error) {
    console.error("Error tracking social link click:", error);
  }
};

/**
 * Track project view
 */
export const trackProjectView = async (
  slug: string,
  projectId: string
): Promise<void> => {
  try {
    // Get user_id from slug
    const { data: portfolioData, error: portfolioError } = await supabase
      .from("portfolios")
      .select("user_id")
      .eq("slug", slug)
      .maybeSingle();

    if (portfolioError || !portfolioData?.user_id) {
      console.error("Failed to find portfolio for slug:", slug, portfolioError);
      return;
    }

    const { error } = await supabase.from("portfolio_analytics").insert({
      user_id: portfolioData.user_id,
      event_type: "project_view",
      slug: slug,
      project_id: projectId,
    });

    if (error) {
      console.error("Failed to track project view:", error);
    }
  } catch (error) {
    console.error("Error tracking project view:", error);
  }
};

/**
 * Get portfolio views for a specific slug
 */
export const getPortfolioViews = async (
  slug: string,
  timeRange: "day" | "week" | "month" | "all" = "all"
): Promise<number> => {
  try {
    let startDate: Date | null = null;
    if (timeRange !== "all") {
      startDate = new Date();
      if (timeRange === "day") {
        startDate.setDate(startDate.getDate() - 1);
      } else if (timeRange === "week") {
        startDate.setDate(startDate.getDate() - 7);
      } else if (timeRange === "month") {
        startDate.setMonth(startDate.getMonth() - 1);
      }
    }

    const query = supabase
      .from("portfolio_analytics")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "view")
      .eq("slug", slug);

    if (startDate) {
      query.gte("created_at", startDate.toISOString());
    }

    const { count, error } = await query;

    if (error) {
      console.error("Failed to get portfolio views:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error getting portfolio views:", error);
    return 0;
  }
};

/**
 * Get top viewed projects for a portfolio
 */
export const getTopProjects = async (
  slug: string
): Promise<Array<{ id: string; views: number }>> => {
  try {
    const { data, error } = await supabase
      .from("portfolio_analytics")
      .select("project_id")
      .eq("event_type", "project_view")
      .eq("slug", slug);

    if (error) {
      console.error("Failed to get top projects:", error);
      return [];
    }

    // Aggregate project views
    const projectViews = new Map<string, number>();
    data?.forEach((event) => {
      const projectId = event.project_id;
      if (projectId) {
        projectViews.set(projectId, (projectViews.get(projectId) || 0) + 1);
      }
    });

    // Convert to array and sort by views
    return Array.from(projectViews.entries())
      .map(([id, views]) => ({ id, views }))
      .sort((a, b) => b.views - a.views);
  } catch (error) {
    console.error("Error getting top projects:", error);
    return [];
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
