
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

interface MatchResultChartProps {
  matchStats: {
    totalMatches: number; // Update to use totalMatches instead of total
    wins: number;
    draws: number;
    losses: number;
  };
}

export function MatchResultChart({ matchStats }: MatchResultChartProps) {
  // Create data for the chart
  const data = [
    { name: "Vinster", value: matchStats.wins, color: "#16a34a" },
    { name: "Oavgjorda", value: matchStats.draws, color: "#f59e0b" },
    { name: "Förluster", value: matchStats.losses, color: "#dc2626" },
  ].filter(item => item.value > 0); // Only show segments with values > 0
  
  // Define chart configuration
  const chartConfig = {
    wins: {
      label: "Vinster",
      color: "#16a34a"
    },
    draws: {
      label: "Oavgjorda",
      color: "#f59e0b"
    },
    losses: {
      label: "Förluster",
      color: "#dc2626"
    }
  };
  
  // Skip rendering if no data or if all values are 0
  if (data.length === 0 || matchStats.totalMatches === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
        Inte tillräckligt med data för att visa diagram
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value} matcher`, '']}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
