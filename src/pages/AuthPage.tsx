import { Button } from "@/components/ui/button";
import { AuthForm } from "@/components/AuthForm";
import { Github, Mail, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "@/services/profile/profileService";

const AuthPage = () => {
  const navigate = useNavigate();

  const handleGoogleSignIn = () => {
    console.log("Google sign-in clicked");
  };

  const handleGithubSignIn = () => {
    console.log("GitHub sign-in clicked");
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
              Sign in to start your{" "}
              <span className="text-indigo-600 dark:text-indigo-400">
                QwikFolio
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Use Google, GitHub, or email to access your dashboard. We’ll
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
                title="Sign in to QwikFolio"
                subtitle="Use your email and password to access your workspace."
                submitLabel="Continue with email"
                mode="signIn"
                onAuthSuccess={async (user) => {
                  if (!user?.id) {
                    navigate("/dashboard/profile-completion");
                    return;
                  }

                  const profile = await getProfile(user.id);

                  if (profile?.onboarding_completed) {
                    navigate("/dashboard");
                  } else {
                    navigate("/dashboard/profile-completion");
                  }
                }}
              />
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
    </div>
  );
};

export default AuthPage;
