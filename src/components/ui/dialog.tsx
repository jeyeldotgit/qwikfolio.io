import * as React from "react";
import { cn } from "@/lib/utils";

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

export const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

type DialogHeaderProps = {
  children: React.ReactNode;
  className?: string;
};

export const DialogHeader = ({ children, className }: DialogHeaderProps) => (
  <div className={cn("mb-3 space-y-1", className)}>{children}</div>
);

type DialogTitleProps = {
  children: React.ReactNode;
  className?: string;
};

export const DialogTitle = ({ children, className }: DialogTitleProps) => (
  <h2
    className={cn(
      "text-sm font-semibold text-slate-900 dark:text-white",
      className
    )}
  >
    {children}
  </h2>
);

type DialogDescriptionProps = {
  children: React.ReactNode;
  className?: string;
};

export const DialogDescription = ({
  children,
  className,
}: DialogDescriptionProps) => (
  <p className={cn("text-xs text-slate-600 dark:text-slate-300", className)}>
    {children}
  </p>
);

type DialogFooterProps = {
  children: React.ReactNode;
  className?: string;
};

export const DialogFooter = ({ children, className }: DialogFooterProps) => (
  <div className={cn("mt-4 flex justify-end gap-2", className)}>{children}</div>
);
