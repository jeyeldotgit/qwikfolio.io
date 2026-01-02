import { Navigate, useLocation } from "react-router-dom";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useEffect, useRef } from "react";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { status } = useAuthSession();
  const location = useLocation();
  const previousStatusRef = useRef<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");

  // Prevent rapid status changes from causing navigation loops
  useEffect(() => {
    previousStatusRef.current = status;
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-8 w-8 border-2 border-slate-300 border-t-emerald-500 dark:border-slate-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    // Only navigate if we're not already on the auth page
    // and if we weren't just authenticated (prevents flicker)
    if (
      location.pathname !== "/auth" &&
      previousStatusRef.current !== "authenticated"
    ) {
      return <Navigate to="/auth" replace />;
    }
    // If we were just authenticated and now unauthenticated,
    // it might be a temporary state change - wait a bit
    if (previousStatusRef.current === "authenticated") {
      // Show loading state briefly to prevent navigation flicker
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
          <div className="h-8 w-8 border-2 border-slate-300 border-t-emerald-500 dark:border-slate-700 rounded-full animate-spin" />
        </div>
      );
    }
    return null;
  }

  return <>{children}</>;
};
