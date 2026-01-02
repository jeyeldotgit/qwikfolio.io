import { useState } from "react";
import { useAuthForm } from "@/hooks/useAuthForm";
import type { SignInFormValues, SignUpFormValues } from "@/schemas/auth";
import { Button } from "@/components/ui/button";
import {
  signInWithEmail,
  signUpWithEmail,
} from "@/services/auth/supabase-auth";
import { useToast } from "@/hooks/useToast";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Mail, CheckCircle2 } from "lucide-react";

type AuthMode = "signIn" | "signUp";

type AuthFormProps = {
  title: string;
  subtitle?: string;
  submitLabel?: string;
  mode?: AuthMode;
  onAuthSuccess?: (user: { id: string } | null) => void;
  onSwitchToSignIn?: () => void;
};

export const AuthForm = ({
  title,
  subtitle,
  submitLabel = "Continue",
  mode = "signIn",
  onAuthSuccess,
  onSwitchToSignIn,
}: AuthFormProps) => {
  const { values, errors, isSubmitting, handleChange, handleSubmit } =
    useAuthForm(mode);
  const { toast } = useToast();
  const [isEmailConfirmationModalOpen, setIsEmailConfirmationModalOpen] =
    useState(false);

  const onValid = (formValues: SignInFormValues | SignUpFormValues) => {
    const action = mode === "signUp" ? signUpWithEmail : signInWithEmail;

    action({
      email: formValues.email,
      password: formValues.password,
    }).then((result) => {
      if ("error" in result) {
        toast({
          variant: "destructive",
          title: mode === "signUp" ? "Sign up failed" : "Sign in failed",
          description:
            result.error ||
            (mode === "signUp"
              ? "Unable to create your account. Please try again."
              : "Invalid email or password. Please check your credentials."),
        });
        return;
      }

      if (mode === "signUp") {
        // Show email confirmation modal for signup
        setIsEmailConfirmationModalOpen(true);
      } else {
        // Show toast for signin success
        toast({
          variant: "success",
          title: "Welcome back!",
          description: "You've been signed in successfully.",
        });

        if (onAuthSuccess) {
          onAuthSuccess(result?.user ?? null);
        }
      }
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 sm:p-8 w-full max-w-md mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {subtitle}
          </p>
        ) : null}
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onValid)} noValidate>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            placeholder="you@example.com"
            value={values.email}
            onChange={(event) => handleChange("email", event.target.value)}
          />
          {errors.email ? (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete={
              mode === "signUp" ? "new-password" : "current-password"
            }
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            placeholder="••••••••"
            value={values.password}
            onChange={(event) => handleChange("password", event.target.value)}
          />
          {errors.password ? (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.password}
            </p>
          ) : null}
        </div>

        {mode === "signUp" ? (
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              placeholder="••••••••"
              value={"confirmPassword" in values ? values.confirmPassword : ""}
              onChange={(event) =>
                handleChange("confirmPassword", event.target.value)
              }
            />
            {errors.confirmPassword ? (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.confirmPassword}
              </p>
            ) : null}
          </div>
        ) : null}

        {mode === "signIn" ? (
          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              className="text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Forgot password?
            </button>
          </div>
        ) : null}

        <Button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm h-10"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : submitLabel}
        </Button>
      </form>

      {/* Email Confirmation Modal */}
      <Dialog
        open={isEmailConfirmationModalOpen}
        onOpenChange={setIsEmailConfirmationModalOpen}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <Mail className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <DialogTitle className="text-lg">Check your email</DialogTitle>
          </div>
          <DialogDescription className="text-sm leading-relaxed">
            We've sent a confirmation email to{" "}
            <span className="font-medium text-slate-900 dark:text-white">
              {values.email}
            </span>
            . Please check your inbox and click the confirmation link to verify
            your account.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <p className="text-xs text-emerald-900 dark:text-emerald-200">
              <span className="font-medium">Step 1:</span> Check your email
              inbox (and spam folder if needed)
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <p className="text-xs text-emerald-900 dark:text-emerald-200">
              <span className="font-medium">Step 2:</span> Click the
              confirmation link in the email
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <p className="text-xs text-emerald-900 dark:text-emerald-200">
              <span className="font-medium">Step 3:</span> Return here and sign
              in with your credentials
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsEmailConfirmationModalOpen(false);
            }}
          >
            Got it
          </Button>
          {onSwitchToSignIn && (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setIsEmailConfirmationModalOpen(false);
                onSwitchToSignIn();
              }}
            >
              Sign in now
            </Button>
          )}
        </DialogFooter>
      </Dialog>
    </div>
  );
};
