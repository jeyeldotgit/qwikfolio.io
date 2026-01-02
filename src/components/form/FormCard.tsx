import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type FormCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export const FormCard = ({
  title,
  description,
  children,
  className,
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
        <CardTitle className="text-base font-semibold text-foreground">
          {title}
        </CardTitle>
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


