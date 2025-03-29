
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { getGradeColor } from '@/utils/gradeUtils';

interface PlayerActivityData {
  name: string;
  activities: number;
  grade: string;
  id: string;
}

interface PlayerActivityChartProps {
  data: PlayerActivityData[];
  config: any;
}

export function PlayerActivityChart({ data, config }: PlayerActivityChartProps) {
  return (
    <ChartContainer config={config}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data.slice(0, 10)} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45} 
            textAnchor="end" 
            height={70} 
            tick={{ fontSize: 12 }}
          />
          <YAxis />
          <ChartTooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-background border border-border rounded-lg p-2 shadow-md">
                    <p className="font-semibold">{data.name}</p>
                    <p>Nivå: {data.grade}</p>
                    <p>Aktiviteter: {data.activities}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Bar dataKey="activities" name="">
            {data.slice(0, 10).map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getGradeColor(entry.grade)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
