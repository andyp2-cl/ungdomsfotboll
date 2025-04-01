
import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface GoalsPerMatchChartProps {
  data: Array<{
    name: string;
    goalsPerMatch: number;
  }>;
}

export function GoalsPerMatchChart({ data }: GoalsPerMatchChartProps) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 70
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45} 
            textAnchor="end" 
            height={70}
          />
          <YAxis />
          <Tooltip 
            formatter={(value) => [`${value} mål/match`, ""]}
          />
          <Bar dataKey="goalsPerMatch" name="Mål per match" fill="#4f46e5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
