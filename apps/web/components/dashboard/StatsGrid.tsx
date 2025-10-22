"use client";

import { MetricCard } from "./MetricCard";

interface StatItem {
  title: string;
  value: string | number;
  icon: keyof typeof import("lucide-react").icons;
  description?: string;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  color?: "marsala" | "gold" | "neutral" | "accent";
}

interface StatsGridProps {
  stats: StatItem[];
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string;
}

export function StatsGrid({
  stats,
  columns = { sm: 1, md: 2, lg: 3 },
  gap = "gap-6",
}: StatsGridProps) {
  const getGridCols = () => {
    const { sm = 1, md = 2, lg = 3, xl = 4 } = columns;

    return [
      `grid-cols-${sm}`,
      `md:grid-cols-${md}`,
      `lg:grid-cols-${lg}`,
      xl ? `xl:grid-cols-${xl}` : "",
    ]
      .filter(Boolean)
      .join(" ");
  };

  return (
    <div className={`grid ${getGridCols()} ${gap}`} data-testid="stats-grid">
      {stats.map((stat, index) => (
        <MetricCard
          key={`${stat.title}-${index}`}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          description={stat.description}
          trend={stat.trend}
          color={stat.color}
        />
      ))}
    </div>
  );
}
