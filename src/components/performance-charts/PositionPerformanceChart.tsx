
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { PositionPerformanceData } from './utils/performanceDataUtils';

interface PositionPerformanceChartProps {
  positionData: PositionPerformanceData[];
}

export function PositionPerformanceChart({ positionData }: PositionPerformanceChartProps) {
  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={positionData}
          margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="position" 
            tick={{ fontSize: 12 }}
            interval={0}
          />
          <YAxis 
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="font-medium">{data.position}</div>
                    <div className="text-sm">
                      Genomsnittlig närvaro: {data.participationAvg}%
                    </div>
                    <div className="text-xs text-green-600">
                      Mål per match: {data.goalsAvg.toFixed(1)}
                    </div>
                    <div className="text-xs text-blue-600">
                      Assist per match: {data.assistsAvg.toFixed(1)}
                    </div>
                    <div className="text-xs text-amber-600">
                      Vinstprocent: {data.winRate}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Antal spelare: {data.count}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="participationAvg" 
            name="Genomsnittlig närvaro" 
            fill="#4f46e5"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
