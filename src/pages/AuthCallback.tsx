import { useAuthSession } from "@/hooks/useAuthSession";
import { hasCompletedOnboarding } from "@/services/auth/supabase-auth";
import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

type CallbackState =
  | "loading"
  | "checking"
  | "dashboard"
  | "onboarding"
  | "unauthenticated";

const AuthCallback = () => {
  const [callbackState, setCallbackState] = useState<CallbackState>("loading");
  const { user, status } = useAuthSession();

  const checkOnboardingStatus = useCallback(async (userId: string) => {
    setCallbackState("checking");
    try {
      const completed = await hasCompletedOnboarding(userId);
      setCallbackState(completed ? "dashboard" : "onboarding");
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      // Default to onboarding if check fails
      setCallbackState("onboarding");
    }
  }, []);

  useEffect(() => {
    // Wait for auth status to be resolved
    if (status === "loading") {
      setCallbackState("loading");
      return;
    }

    // User is not authenticated, redirect to auth page
    if (status === "unauthenticated" || !user) {
      setCallbackState("unauthenticated");
      return;
    }

    // User is authenticated, check onboarding status
    checkOnboardingStatus(user.id);
  }, [status, user, checkOnboardingStatus]);

  // Handle navigation based on state
  if (callbackState === "dashboard") {
    return <Navigate to="/dashboard" replace />;
  }

  if (callbackState === "onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  if (callbackState === "unauthenticated") {
    return <Navigate to="/auth" replace />;
  }

  // Show loading state while auth is being processed
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="text-sm text-muted-foreground">
          {callbackState === "loading"
            ? "Authenticating..."
            : "Setting up your account..."}
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
