import type { ReactNode } from "react";

type FormSectionProps = {
  title: string;
  children: ReactNode;
  required?: boolean;
};

export const FormSection = ({ title, children, required }: FormSectionProps) => {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
        {required && (
          <span className="ml-1 text-red-500 font-medium" aria-label="required">*</span>
        )}
      </h3>
      {children}
    </div>
  );
};


