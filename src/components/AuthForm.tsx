import { useAuthForm } from "@/hooks/useAuthForm";
import type { SignInFormValues, SignUpFormValues } from "@/schemas/auth";
import { Button } from "@/components/ui/button";
import {
  signInWithEmail,
  signUpWithEmail,
} from "@/services/auth/supabase-auth";
import { useToast } from "@/hooks/useToast";

type AuthMode = "signIn" | "signUp";

type AuthFormProps = {
  title: string;
  subtitle?: string;
  submitLabel?: string;
  mode?: AuthMode;
  onAuthSuccess?: (user: { id: string } | null) => void;
};

export const AuthForm = ({
  title,
  subtitle,
  submitLabel = "Continue",
  mode = "signIn",
  onAuthSuccess,
}: AuthFormProps) => {
  const { values, errors, isSubmitting, handleChange, handleSubmit } =
    useAuthForm(mode);
  const { toast } = useToast();

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

      toast({
        variant: "success",
        title: mode === "signUp" ? "Account created!" : "Welcome back!",
        description:
          mode === "signUp"
            ? "Your account has been created successfully."
            : "You've been signed in successfully.",
      });

      if (onAuthSuccess) {
        onAuthSuccess(result?.user ?? null);
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
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
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
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
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
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
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
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Forgot password?
            </button>
          </div>
        ) : null}

        <Button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm h-10"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : submitLabel}
        </Button>
      </form>
    </div>
  );
};
