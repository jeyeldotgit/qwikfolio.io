import { useState } from "react";
import {
  signInSchema,
  signUpSchema,
  type SignInFormValues,
  type SignUpFormValues,
} from "@/schemas/auth";

type AuthMode = "signIn" | "signUp";

type AuthFormState<T extends AuthMode> = {
  values: T extends "signUp" ? SignUpFormValues : SignInFormValues;
  errors: Partial<Record<string, string>>;
  isSubmitting: boolean;
};

type UseAuthFormResult<T extends AuthMode> = {
  values: T extends "signUp" ? SignUpFormValues : SignInFormValues;
  errors: Partial<Record<string, string>>;
  isSubmitting: boolean;
  handleChange: (field: string, value: string) => void;
  handleSubmit: (
    onValid: (values: T extends "signUp" ? SignUpFormValues : SignInFormValues) => void
  ) => (event: React.FormEvent) => void;
};

export const useAuthForm = <T extends AuthMode>(
  mode: T
): UseAuthFormResult<T> => {
  const [state, setState] = useState<AuthFormState<T>>({
    values: (mode === "signUp"
      ? { email: "", password: "", confirmPassword: "" }
      : { email: "", password: "" }) as T extends "signUp"
      ? SignUpFormValues
      : SignInFormValues,
    errors: {},
    isSubmitting: false,
  });

  const handleChange = (field: string, value: string) => {
    setState((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        [field]: value,
      } as T extends "signUp" ? SignUpFormValues : SignInFormValues,
      errors: {
        ...prev.errors,
        [field]: undefined,
      },
    }));
  };

  const handleSubmit =
    (
      onValid: (values: T extends "signUp" ? SignUpFormValues : SignInFormValues) => void
    ) =>
    (event: React.FormEvent) => {
      event.preventDefault();

      const schema = mode === "signUp" ? signUpSchema : signInSchema;
      const parsed = schema.safeParse(state.values);

      if (!parsed.success) {
        const fieldErrors: Partial<Record<string, string>> = {};

        parsed.error.issues.forEach((issue) => {
          const field = issue.path[0] as string;
          fieldErrors[field] = issue.message;
        });

        setState((prev) => ({
          ...prev,
          errors: fieldErrors,
          isSubmitting: false,
        }));

        return;
      }

      setState((prev) => ({
        ...prev,
        isSubmitting: true,
        errors: {},
      }));

      onValid(parsed.data as T extends "signUp" ? SignUpFormValues : SignInFormValues);

      setState((prev) => ({
        ...prev,
        isSubmitting: false,
      }));
    };

  return {
    values: state.values,
    errors: state.errors,
    isSubmitting: state.isSubmitting,
    handleChange,
    handleSubmit,
  } as UseAuthFormResult<T>;
};


