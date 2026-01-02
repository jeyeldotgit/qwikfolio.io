import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsDataPoint } from "@/services/analytics/analyticsService";

type AnalyticsChartProps = {
  data: AnalyticsDataPoint[];
  isLoading?: boolean;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <p className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">
          {label ? formatDate(label) : ""}
        </p>
        {payload.map((entry) => (
          <p
            key={entry.dataKey}
            className="text-sm"
            style={{ color: entry.color }}
          >
            {entry.dataKey === "views" ? "Views" : "Downloads"}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const AnalyticsChart = ({ data, isLoading }: AnalyticsChartProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Portfolio Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData = data.some((d) => d.views > 0 || d.downloads > 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-slate-900 dark:text-white">
          Portfolio Activity
        </CardTitle>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Views and downloads over the last 7 days
        </p>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="downloadsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-700"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-slate-500 dark:text-slate-400"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  className="text-slate-500 dark:text-slate-400"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-xs text-slate-600 dark:text-slate-300">
                      {value === "views" ? "Views" : "Downloads"}
                    </span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#viewsGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#10b981" }}
                />
                <Area
                  type="monotone"
                  dataKey="downloads"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fill="url(#downloadsGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#06b6d4" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-[300px] flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <span className="text-xl">📊</span>
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              No activity yet
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Share your portfolio to start seeing analytics
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

