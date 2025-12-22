import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type FormCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export const FormCard = ({ title, description, children, className }: FormCardProps) => {
  return (
    <Card className={cn("border-slate-200 dark:border-slate-800", className)}>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">
          {title}
        </CardTitle>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-6">{children}</CardContent>
    </Card>
  );
};


