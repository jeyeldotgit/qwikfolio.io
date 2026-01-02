import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaWithCounterProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    maxLength?: number;
    showCount?: boolean;
  };

const TextareaWithCounter = React.forwardRef<
  HTMLTextAreaElement,
  TextareaWithCounterProps
>(({ className, maxLength, showCount = true, value, ...props }, ref) => {
  const currentLength = typeof value === "string" ? value.length : 0;
  const isNearLimit = maxLength && currentLength >= maxLength * 0.9;
  const isAtLimit = maxLength && currentLength >= maxLength;

  return (
    <div className="relative">
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
          maxLength && "pb-6",
          className
        )}
        ref={ref}
        value={value}
        maxLength={maxLength}
        {...props}
      />
      {showCount && maxLength && (
        <div
          className={cn(
            "absolute bottom-2 right-3 text-[10px] tabular-nums",
            isAtLimit
              ? "text-red-500"
              : isNearLimit
                ? "text-amber-500"
                : "text-slate-400 dark:text-slate-500"
          )}
        >
          {currentLength}/{maxLength}
        </div>
      )}
    </div>
  );
});

TextareaWithCounter.displayName = "TextareaWithCounter";

export { TextareaWithCounter };

