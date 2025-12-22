import type { ReactNode } from "react";

type FormSectionProps = {
  title: string;
  children: ReactNode;
};

export const FormSection = ({ title, children }: FormSectionProps) => {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
};


