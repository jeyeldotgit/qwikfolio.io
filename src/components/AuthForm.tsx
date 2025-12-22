import { useAuthForm } from "@/hooks/useAuthForm";
import type { AuthFormValues } from "@/schemas/auth";
import { Button } from "@/components/ui/button";

type AuthFormProps = {
  title: string;
  subtitle?: string;
  submitLabel?: string;
};

export const AuthForm = ({ title, subtitle, submitLabel = "Continue" }: AuthFormProps) => {
  const { values, errors, isSubmitting, handleChange, handleSubmit } = useAuthForm();

  const onValid = (formValues: AuthFormValues) => {
    // For now, just log the values. Backend will be wired later.
    console.log("Auth form submitted", formValues);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 sm:p-8 w-full max-w-md mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h2>
        {subtitle ? (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
        ) : null}
      </div>

      <form
        className="space-y-4"
        onSubmit={handleSubmit(onValid)}
        noValidate
      >
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
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>
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
            autoComplete="current-password"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            placeholder="••••••••"
            value={values.password}
            onChange={(event) => handleChange("password", event.target.value)}
          />
          {errors.password ? (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password}</p>
          ) : null}
        </div>

        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
            onClick={() => console.log("Forgot password clicked")}
          >
            Forgot password?
          </button>
        </div>

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


