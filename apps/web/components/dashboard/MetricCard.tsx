"use client";

import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { icons } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof icons;
  description?: string;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  color?: "marsala" | "gold" | "neutral" | "accent";
}

export function MetricCard({
  title,
  value,
  icon,
  description,
  trend,
  color = "marsala",
}: MetricCardProps) {
  const IconComponent = icons[icon] as LucideIcon;

  const getColorClasses = () => {
    switch (color) {
      case "marsala":
        return "text-marsala";
      case "gold":
        return "text-gold";
      case "neutral":
        return "text-neutral-graphite";
      case "accent":
        return "text-accent-blush";
      default:
        return "text-marsala";
    }
  };

  const getTrendColor = () => {
    if (!trend) return "";
    return trend.direction === "up" ? "text-green-600" : "text-red-600";
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend.direction === "up" ? TrendingUp : TrendingDown;
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-neutral-light p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`p-2 rounded-lg bg-neutral-pearl ${getColorClasses()}`}
            >
              <IconComponent className="w-5 h-5" data-testid="metric-icon" />
            </div>
            <h3 className="text-sm font-medium text-neutral-graphite">
              {title}
            </h3>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-graphite">
              {value}
            </span>

            {trend && (
              <div className={`flex items-center gap-1 ${getTrendColor()}`}>
                {TrendIcon && (
                  <TrendIcon
                    className="w-4 h-4"
                    data-testid={`trend-${trend.direction}`}
                  />
                )}
                <span className="text-sm font-medium">
                  {trend.direction === "up" ? "+" : "-"}
                  {trend.value}%
                </span>
              </div>
            )}
          </div>

          {description && (
            <p className="text-xs text-neutral-graphite mt-1 opacity-75">
              {description}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
