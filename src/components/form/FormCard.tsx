import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type FormCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  required?: boolean;
};

export const FormCard = ({
  title,
  description,
  children,
  className,
  required,
}: FormCardProps) => {
  return (
    <Card
      className={cn(
        "border-slate-200 dark:border-slate-800",
        "overflow-hidden",
        className
      )}
    >
      <CardHeader className="px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold text-foreground">
            {title}
          </CardTitle>
          {required && (
            <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-950/50 dark:text-red-400 dark:ring-red-500/30">
              Required
            </span>
          )}
        </div>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-5 px-4 pb-5 sm:space-y-6 sm:px-6 sm:pb-6">
        {children}
      </CardContent>
    </Card>
  );
};


