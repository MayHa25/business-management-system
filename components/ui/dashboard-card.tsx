"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  className?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export function DashboardCard({
  title,
  value,
  icon,
  description,
  className,
  trend,
  trendValue,
}: DashboardCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="p-2 bg-muted rounded-md">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && trendValue && (
          <div className="flex items-center mt-1">
            <span
              className={cn(
                "text-xs",
                trend === "up" && "text-green-600",
                trend === "down" && "text-red-600",
                trend === "neutral" && "text-gray-500"
              )}
            >
              {trend === "up" && "↑"}
              {trend === "down" && "↓"}
              {trend === "neutral" && "→"} {trendValue}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}