import supabase from "@/lib/supabase";

type AnalyticsEventType = "view" | "download";

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
      `Unexpected error fetching stats: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

