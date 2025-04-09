
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PlayerActivityChartProps {
  data: any[];
  config: {
    gradeColors: Record<string, string>;
  };
  onBarClick?: (playerId: string) => void;
}

export function PlayerActivityChart({ data, config, onBarClick }: PlayerActivityChartProps) {
  const sortedData = [...data].sort((a, b) => b.activityCount - a.activityCount);
  const topPlayers = sortedData.slice(0, 15); // Only show top 15 players

  const handleBarClick = (data: any) => {
    if (onBarClick && data.id) {
      onBarClick(data.id);
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={topPlayers}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" />
        <YAxis 
          type="category" 
          dataKey="name" 
          width={100}
          tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 12)}...` : value}
        />
        <Tooltip
          formatter={(value, name) => [value, 'Aktiviteter']}
          labelFormatter={(label) => `Spelare: ${label}`}
        />
        <Bar 
          dataKey="activityCount" 
          name="Aktiviteter" 
          fill="#8884d8"
          onClick={onBarClick ? handleBarClick : undefined}
          cursor={onBarClick ? "pointer" : "default"}
          fillOpacity={0.8}
          isAnimationActive={true}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
