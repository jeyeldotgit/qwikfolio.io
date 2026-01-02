import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
};

export const StatCard = ({
  title,
  value,
  icon: Icon,
  iconColor = "text-emerald-500",
  trend,
  subtitle,
}: StatCardProps) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value === 0) return Minus;
    return trend.isPositive ? TrendingUp : TrendingDown;
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {title}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            {trend && (
              <div className="flex items-center gap-1">
                {TrendIcon && (
                  <TrendIcon
                    className={`h-3 w-3 ${
                      trend.value === 0
                        ? "text-slate-400"
                        : trend.isPositive
                          ? "text-emerald-500"
                          : "text-red-500"
                    }`}
                  />
                )}
                <span
                  className={`text-xs font-medium ${
                    trend.value === 0
                      ? "text-slate-400"
                      : trend.isPositive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {trend.value > 0 ? "+" : ""}
                  {trend.value}%
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  vs last week
                </span>
              </div>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 ${iconColor}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {/* Decorative gradient */}
        <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 blur-2xl" />
      </CardContent>
    </Card>
  );
};

