import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Download, Zap } from "lucide-react";

type DevPortfolioTopHeaderProps = {
  onDownloadResume?: () => void | Promise<void>;
};

export const DevPortfolioTopHeader = ({
  onDownloadResume,
}: DevPortfolioTopHeaderProps) => {
  return (
    <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/70 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-950/50">
      <div className="mx-auto max-w-6xl px-6 py-3">
        <div className="flex items-center justify-between gap-3">

          <div className="flex items-center gap-1">
          <Zap className="h-6 w-6 " 
                      style={{
                        color: "var(--portfolio-primary)",
                      }}/>
            <span className="text-lg font-semibold text-slate-900 dark:text-white">
              QwikFolio.io
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
            type="button"
            size="sm"
            className="text-white transition-[filter] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--portfolio-primary) focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-950"
            style={{
              backgroundColor: "var(--portfolio-primary)",
            }}
            onClick={async () => {
              await onDownloadResume?.();
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "var(--portfolio-primary-dark)";
              e.currentTarget.style.filter = "brightness(0.98)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--portfolio-primary)";
              e.currentTarget.style.filter = "none";
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Resume/CV
          </Button>

          <ThemeToggle /></div>
          
        </div>
      </div>
    </div>
  );
};


