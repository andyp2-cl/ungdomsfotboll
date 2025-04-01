
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { PlayerPerformanceData, CHART_COLORS } from './utils/performanceDataUtils';

interface WinRateChartProps {
  winRateData: PlayerPerformanceData[];
}

export function WinRateChart({ winRateData }: WinRateChartProps) {
  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={winRateData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis 
            type="number" 
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis 
            dataKey="name" 
            type="category" 
            tick={{ fontSize: 12 }} 
            width={100}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const player = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="font-medium">{player.name}</div>
                    <div className="text-sm">Vinstprocent: {player.winRate}%</div>
                    <div className="text-sm">Matcher: {player.matchCount}</div>
                    <div className="text-sm">Vinster: {player.winCount}</div>
                    <div className="text-xs text-muted-foreground">
                      Mål: {player.totalGoals}, Assist: {player.totalAssists}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="winRate" 
            fill="#f59e0b"
            radius={[0, 4, 4, 0]}
          >
            {winRateData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
