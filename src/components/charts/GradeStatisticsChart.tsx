
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { getGradeColor } from '@/utils/gradeUtils';

interface GradeData {
  grade: string;
  count: number;
  players: number;
  average: number;
}

interface GradeStatisticsChartProps {
  data: GradeData[];
  config: any;
}

export function GradeStatisticsChart({ data, config }: GradeStatisticsChartProps) {
  // Make sure config has gradeColors, and if not, use an empty object
  const configWithGradeColors = {
    ...config,
    gradeColors: config.gradeColors || {}
  };
  
  return (
    <ChartContainer config={configWithGradeColors}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="grade" />
          <YAxis />
          <ChartTooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-background border border-border rounded-lg p-2 shadow-md">
                    <p className="font-semibold">Nivå {data.grade}</p>
                    <p>Antal spelare: {data.players}</p>
                    <p>Totalt antal aktiviteter: {data.count}</p>
                    <p>Genomsnitt per spelare: {data.average}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="average" 
            name="Genomsnitt"
          >
            {data.map((entry) => (
              <Cell key={`cell-${entry.grade}`} fill={getGradeColor(entry.grade)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
