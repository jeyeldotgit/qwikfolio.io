import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Zap, Save, Check, Loader2, Eye, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

type SaveStatus = "idle" | "saving" | "saved" | "unsaved";
type AutosaveStatus = "idle" | "saving" | "saved" | "error";

type BuilderHeaderProps = {
  saveStatus: SaveStatus;
  autosaveStatus?: AutosaveStatus;
  lastSavedAt?: Date | null;
  onSave: () => void;
  onPreview: () => void;
  isSaving: boolean;
};

export const BuilderHeader = ({
  saveStatus,
  autosaveStatus,
  lastSavedAt,
  onSave,
  onPreview,
  isSaving,
}: BuilderHeaderProps) => {
  const navigate = useNavigate();

  const formatTimeAgo = (date: Date | null): string => {
    if (!date) return "";
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 10) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getSaveStatusIndicator = () => {
    // Show autosave status if available
    if (autosaveStatus === "saving") {
      return (
        <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span className="hidden xs:inline">Saving...</span>
        </span>
      );
    }

    if (autosaveStatus === "saved" && lastSavedAt) {
      return (
        <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
          <Check className="h-3 w-3" />
          <span className="hidden xs:inline">Saved {formatTimeAgo(lastSavedAt)}</span>
        </span>
      );
    }

    // Fallback to manual save status
    switch (saveStatus) {
      case "saving":
        return (
          <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="hidden xs:inline">Saving...</span>
          </span>
        );
      case "saved":
        return (
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <Check className="h-3 w-3" />
            <span className="hidden xs:inline">Saved</span>
          </span>
        );
      case "unsaved":
        return (
          <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span className="hidden xs:inline">Unsaved</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-3 sm:h-16 sm:px-6 lg:px-8">
        {/* Left - Back + Logo */}
        <div className="flex items-center gap-2">
          {/* Mobile back button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 sm:hidden"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <button
            type="button"
            className="flex items-center gap-1.5 transition-opacity hover:opacity-80 sm:gap-2"
            onClick={() => navigate("/")}
          >
            <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400 sm:h-6 sm:w-6" />
            <span className="hidden text-lg font-semibold text-slate-900 dark:text-white sm:inline">
              QwikFolio.io
            </span>
          </button>
        </div>

        {/* Center - Save Status (desktop) */}
        <div className="hidden flex-1 justify-center sm:flex">
          {getSaveStatusIndicator()}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Mobile save status */}
          <div className="sm:hidden">{getSaveStatusIndicator()}</div>

          <ThemeToggle className="h-8 w-8 sm:h-9 sm:w-9" />

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hidden sm:flex"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2 sm:h-9 sm:px-3"
            onClick={onPreview}
          >
            <Eye className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Preview</span>
          </Button>

          <Button
            type="button"
            size="sm"
            className={cn(
              "h-8 bg-emerald-600 px-2 text-white hover:bg-emerald-500 sm:h-9 sm:px-3",
              isSaving && "cursor-not-allowed opacity-70"
            )}
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Save Draft</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};
