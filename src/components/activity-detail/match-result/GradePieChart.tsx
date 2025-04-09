
import React, { useMemo } from 'react';
import { Activity } from "@/types/player";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { getGradeColor } from '@/utils/gradeUtils';

interface GradePieChartProps {
  activity: Activity;
  participatingPlayers: any[];
}

export function GradePieChart({ activity, participatingPlayers }: GradePieChartProps) {
  // Count players by grade
  const gradeDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    
    participatingPlayers.forEach(player => {
      if (!player.positions?.includes("TRÄNARE") && player.grade) {
        distribution[player.grade] = (distribution[player.grade] || 0) + 1;
      }
    });
    
    // Convert to array format for the chart
    return Object.entries(distribution).map(([grade, count]) => ({
      grade,
      count,
    })).sort((a, b) => a.grade.localeCompare(b.grade));
  }, [participatingPlayers]);
  
  // Skip rendering if no data
  if (gradeDistribution.length === 0) return null;
  
  return (
    <div className="mt-6">
      <h4 className="text-sm font-medium mb-2">Deltagarfördelning</h4>
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={gradeDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={70}
              fill="#8884d8"
              dataKey="count"
              nameKey="grade"
              label={({ grade, count, percent }) => 
                `${grade}: ${count} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {gradeDistribution.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getGradeColor(entry.grade)} 
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name, props) => [`${value} spelare`, `Nivå ${props.payload.grade}`]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
