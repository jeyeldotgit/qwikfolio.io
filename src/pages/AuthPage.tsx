import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AuthForm } from "@/components/AuthForm";
import { Github, Mail, Zap, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "@/services/profile/profileService";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const AuthPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [isSocialAuthModalOpen, setIsSocialAuthModalOpen] = useState(false);
  const [socialAuthProvider, setSocialAuthProvider] = useState<
    "Google" | "GitHub" | null
  >(null);

  const handleGoogleSignIn = () => {
    setSocialAuthProvider("Google");
    setIsSocialAuthModalOpen(true);
  };

  const handleGithubSignIn = () => {
    setSocialAuthProvider("GitHub");
    setIsSocialAuthModalOpen(true);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-roboto">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            type="button"
            className="flex items-center space-x-2"
            onClick={handleGoHome}
          >
            <Zap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <span className="text-lg font-semibold text-slate-900 dark:text-white">
              QwikFolio.io
            </span>
          </button>
          <ThemeToggle />
          <Button
            variant="outline"
            className="text-xs sm:text-sm h-8"
            onClick={handleGoHome}
          >
            Back to landing
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl grid gap-10 lg:grid-cols-[1.1fr_1fr] items-center">
          <div className="space-y-4 max-w-xl">
            <p className="inline-flex items-center text-xs font-medium tracking-wide uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full">
              Build once. Ship your career.
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              {mode === "signIn" ? "Sign in" : "Create an account"} to start
              your{" "}
              <span className="text-indigo-600 dark:text-indigo-400">
                QwikFolio
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Use Google, GitHub, or email to{" "}
              {mode === "signIn" ? "access" : "create"} your dashboard. We'll
              generate a clean portfolio and resume from structured data—no
              design skills, no setup friction.
            </p>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>
                • One profile powers both your public portfolio and printable
                resume.
              </li>
              <li>
                • Optimized for developers, students, and working professionals.
              </li>
              <li>
                • You control your data. Export and iterate whenever you want.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-4 sm:p-6">
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-center h-9 text-xs sm:text-sm"
                  onClick={handleGoogleSignIn}
                >
                  <Mail className="mr-2 h-4 w-4 text-red-500" />
                  Continue with Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-center h-9 text-xs sm:text-sm"
                  onClick={handleGithubSignIn}
                >
                  <Github className="mr-2 h-4 w-4" />
                  Continue with GitHub
                </Button>
              </div>

              <div className="flex items-center my-4">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                <span className="mx-3 text-xs text-slate-500 dark:text-slate-400">
                  or continue with email
                </span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              </div>

              <AuthForm
                title={
                  mode === "signIn"
                    ? "Sign in to QwikFolio"
                    : "Create your account"
                }
                subtitle={
                  mode === "signIn"
                    ? "Use your email and password to access your workspace."
                    : "Enter your details to get started with QwikFolio."
                }
                submitLabel={mode === "signIn" ? "Sign in" : "Create account"}
                mode={mode}
                onAuthSuccess={async (user) => {
                  if (!user?.id) {
                    navigate("/onboarding");
                    return;
                  }

                  const profile = await getProfile(user.id);

                  if (profile?.onboarding_completed) {
                    navigate("/dashboard");
                  } else {
                    navigate("/onboarding");
                  }
                }}
                onSwitchToSignIn={() => setMode("signIn")}
              />

              <div className="mt-4 text-center">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {mode === "signIn"
                    ? "Don't have an account? "
                    : "Already have an account? "}
                  <button
                    type="button"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    onClick={() =>
                      setMode(mode === "signIn" ? "signUp" : "signIn")
                    }
                  >
                    {mode === "signIn" ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </div>
            </div>

            <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 px-4">
              By continuing, you agree to QwikFolio&apos;s{" "}
              <button
                type="button"
                className="underline underline-offset-2"
                onClick={() => console.log("View Terms clicked")}
              >
                Terms
              </button>{" "}
              and{" "}
              <button
                type="button"
                className="underline underline-offset-2"
                onClick={() => console.log("View Privacy clicked")}
              >
                Privacy Policy
              </button>
              .
            </p>
          </div>
        </div>
      </main>

      {/* Social Auth Not Available Modal */}
      <Dialog
        open={isSocialAuthModalOpen}
        onOpenChange={setIsSocialAuthModalOpen}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <DialogTitle className="text-lg">
              {socialAuthProvider} sign-in coming soon
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm leading-relaxed">
            {socialAuthProvider} authentication is not yet available. We're
            working on adding this feature to make signing in even easier.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
          <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
            In the meantime, you can:
          </p>
          <div className="space-y-1.5">
            <div className="flex items-start gap-2">
              <span className="text-xs text-amber-800 dark:text-amber-300">
                •
              </span>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                Sign in or sign up using your email and password
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xs text-amber-800 dark:text-amber-300">
                •
              </span>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                Check back soon for {socialAuthProvider} authentication support
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsSocialAuthModalOpen(false)}
          >
            Got it
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setIsSocialAuthModalOpen(false);
              // Focus on email form or switch to email sign-in
              const emailInput = document.getElementById("email");
              if (emailInput) {
                emailInput.focus();
              }
            }}
          >
            Use email instead
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default AuthPage;
