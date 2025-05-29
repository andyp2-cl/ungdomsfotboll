
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatPositions, isTrainer } from '@/utils/positionUtils';

interface PlayerActivityChartProps {
  data: any[];
  config: {
    gradeColors?: Record<string, string>; // Make gradeColors optional
  };
  onBarClick?: (playerId: string) => void;
}

export function PlayerActivityChart({ data, config, onBarClick }: PlayerActivityChartProps) {
  // Filter out trainers and add position formatting
  const processedData = data
    .filter(player => !isTrainer(player.positions))
    .map(player => ({
      ...player,
      formattedPositions: formatPositions(player.positions, true)
    }))
    .sort((a, b) => (b.activities || b.activityCount || 0) - (a.activities || a.activityCount || 0));
    
  const topPlayers = processedData.slice(0, 15); // Only show top 15 players

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
          labelFormatter={(label, payload) => {
            if (payload && payload.length > 0) {
              const data = payload[0].payload;
              return (
                <div>
                  <div className="font-medium">{data.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {data.formattedPositions} • Nivå {data.grade}
                    {data.jerseyNumber && ` • #${data.jerseyNumber}`}
                  </div>
                </div>
              );
            }
            return `Spelare: ${label}`;
          }}
          contentStyle={{
            backgroundColor: 'white',
            borderRadius: '6px',
            padding: '8px 12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}
        />
        <Bar 
          dataKey={topPlayers[0]?.activities !== undefined ? "activities" : "activityCount"} 
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
