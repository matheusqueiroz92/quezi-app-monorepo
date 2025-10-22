"use client";

import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartCardProps {
  title: string;
  description?: string;
  data: any[];
  dataKey: string;
  color?: string;
  height?: number;
  stats?: {
    total: string;
    change: string;
    period: string;
  };
}

export function ChartCard({
  title,
  description,
  data,
  dataKey,
  color = "#69042A",
  height = 300,
  stats,
}: ChartCardProps) {
  return (
    <Card className="bg-white rounded-xl shadow-sm border border-neutral-light p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-neutral-graphite mb-1">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-neutral-graphite opacity-75">
            {description}
          </p>
        )}
      </div>

      {stats && (
        <div className="flex items-center gap-6 mb-4">
          <div>
            <p className="text-2xl font-bold text-marsala">{stats.total}</p>
            <p className="text-sm text-neutral-graphite">Total</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-green-600">
              {stats.change}
            </p>
            <p className="text-sm text-neutral-graphite">{stats.period}</p>
          </div>
        </div>
      )}

      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#6B6B6B" fontSize={12} />
            <YAxis stroke="#6B6B6B" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
