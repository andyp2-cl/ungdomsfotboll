
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { getPositionColor, getPositionLabel } from './positionUtils';
import { PlayerPosition } from '@/types/player';

interface PositionStat {
  name: string;
  value: number;
  color: string;
}

interface PositionDistributionChartProps {
  positionStats: PositionStat[];
}

export function PositionDistributionChart({ positionStats }: PositionDistributionChartProps) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={positionStats}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => 
              `${getPositionLabel(name as PlayerPosition)} ${(percent * 100).toFixed(0)}%`
            }
          >
            {positionStats.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [
              `${value} spelare`, 
              getPositionLabel(name as PlayerPosition)
            ]}
          />
          <Legend formatter={(value) => getPositionLabel(value as PlayerPosition)} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
