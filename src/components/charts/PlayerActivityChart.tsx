
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PlayerActivityChartProps {
  data: any[];
  config: {
    gradeColors?: Record<string, string>;
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
        margin={{ top: 5, right: 30, left: 90, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" />
        <YAxis 
          type="category" 
          dataKey="name" 
          width={85}
          tick={(props) => {
            const { x, y, payload } = props;
            const name = payload.value;
            // Split name into first name and last name
            const nameParts = name.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');
            
            return (
              <g transform={`translate(${x},${y})`}>
                <text x={-5} y={0} dy={4} textAnchor="end" fill="#666" fontSize={12}>
                  {firstName}
                </text>
                <text x={-5} y={16} dy={4} textAnchor="end" fill="#666" fontSize={12} fontWeight="bold">
                  {lastName}
                </text>
              </g>
            );
          }}
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
