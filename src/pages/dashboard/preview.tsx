import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Zap, FileText, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePortfolioPreview } from "@/hooks/usePortfolioPreview";
import { PortfolioPreview } from "@/components/preview/PortfolioPreview";
import { DevPortfolio } from "@/components/preview/DevPortfolio";
import { useAuthSession } from "@/hooks/useAuthSession";
import { trackResumeDownload } from "@/services/analytics/analyticsService";

type ViewMode = "portfolio" | "resume";

const DashboardPreviewPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthSession();
  const { isLoading, portfolio } = usePortfolioPreview();
  const shouldPrint = searchParams.get("print") === "true";
  const [viewMode, setViewMode] = useState<ViewMode>("portfolio");

  useEffect(() => {
    if (shouldPrint && portfolio && !isLoading) {
      const timer = setTimeout(async () => {
        if (user?.id) {
          await trackResumeDownload(user.id);
        }
        window.print();
        navigate("/dashboard/preview", { replace: true });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [shouldPrint, portfolio, isLoading, navigate, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="h-8 w-8 border-2 border-slate-700 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header - Hidden on print */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl print:hidden">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <button
            type="button"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
            onClick={() => navigate("/dashboard")}
          >
            <Zap className="h-5 w-5 text-emerald-500" />
            <span className="text-sm font-semibold text-white">
              QwikFolio.io
            </span>
          </button>

          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("portfolio")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  viewMode === "portfolio"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Layout className="h-3.5 w-3.5" />
                Portfolio
              </button>
              <button
                type="button"
                onClick={() => setViewMode("resume")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  viewMode === "resume"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                Resume
              </button>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
              onClick={() => navigate("/dashboard/builder")}
            >
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-emerald-600 text-white hover:bg-emerald-500"
              onClick={async () => {
                if (user?.id) {
                  await trackResumeDownload(user.id);
                }
                window.print();
              }}
            >
              Print / PDF
            </Button>
          </div>
        </div>
      </header>

      <main>
        {portfolio ? (
          <>
            {/* Web Portfolio View */}
            {viewMode === "portfolio" && <DevPortfolio portfolio={portfolio} />}

            {/* Resume View (also used for print) */}
            {viewMode === "resume" && (
              <div className="py-8 print:py-0">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 print:px-0">
                  <PortfolioPreview portfolio={portfolio} />
                </div>
              </div>
            )}

            {/* Hidden print version - always renders resume layout */}
            <div className="hidden print:block">
              <PortfolioPreview portfolio={portfolio} />
            </div>
          </>
        ) : (
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              Your portfolio data is not ready yet. Go back to the builder, add
              your details, and try again.
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPreviewPage;
