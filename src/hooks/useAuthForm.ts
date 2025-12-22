import { useState } from "react";
import { authFormSchema, type AuthFormValues } from "@/schemas/auth";

type AuthFormState = {
  values: AuthFormValues;
  errors: Partial<Record<keyof AuthFormValues, string>>;
  isSubmitting: boolean;
};

type UseAuthFormResult = {
  values: AuthFormValues;
  errors: Partial<Record<keyof AuthFormValues, string>>;
  isSubmitting: boolean;
  handleChange: (field: keyof AuthFormValues, value: string) => void;
  handleSubmit: (onValid: (values: AuthFormValues) => void) => (event: React.FormEvent) => void;
};

export const useAuthForm = (): UseAuthFormResult => {
  const [state, setState] = useState<AuthFormState>({
    values: {
      email: "",
      password: "",
    },
    errors: {},
    isSubmitting: false,
  });

  const handleChange = (field: keyof AuthFormValues, value: string) => {
    setState((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        [field]: value,
      },
      errors: {
        ...prev.errors,
        [field]: undefined,
      },
    }));
  };

  const handleSubmit =
    (onValid: (values: AuthFormValues) => void) => (event: React.FormEvent) => {
      event.preventDefault();

      const parsed = authFormSchema.safeParse(state.values);

      if (!parsed.success) {
        const fieldErrors: Partial<Record<keyof AuthFormValues, string>> = {};

        parsed.error.issues.forEach((issue) => {
          const field = issue.path[0];
          if (field === "email" || field === "password") {
            fieldErrors[field] = issue.message;
          }
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

      onValid(parsed.data);

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
  };
};


