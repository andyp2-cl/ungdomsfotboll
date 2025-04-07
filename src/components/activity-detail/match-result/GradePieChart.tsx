
import React, { useMemo } from "react";
import { Activity, Player, PlayerGrade } from "@/types/player";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface GradePieChartProps {
  activity: Activity;
  participatingPlayers: Player[];
}

export function GradePieChart({ activity, participatingPlayers }: GradePieChartProps) {
  // Calculate grade distribution
  const gradeDistribution = useMemo(() => {
    const grades: Record<PlayerGrade, number> = {
      'A': 0,
      'B': 0,
      'C': 0,
      'D': 0
    };
    
    participatingPlayers.forEach(player => {
      if (player.grade && grades[player.grade as PlayerGrade] !== undefined) {
        grades[player.grade as PlayerGrade]++;
      }
    });

    // Convert to array for recharts
    return Object.entries(grades).map(([grade, count]) => ({
      grade,
      count,
      percentage: participatingPlayers.length ? Math.round((count / participatingPlayers.length) * 100) : 0
    })).filter(item => item.count > 0);
  }, [participatingPlayers]);

  // Skip rendering if no data
  if (!gradeDistribution.length) {
    return null;
  }

  // Colors for each grade
  const GRADE_COLORS: Record<string, string> = {
    'A': '#10b981', // green
    'B': '#3b82f6', // blue
    'C': '#f59e0b', // amber
    'D': '#ef4444'  // red
  };

  // Custom label for the pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${gradeDistribution[index].grade}`}
      </text>
    );
  };

  return (
    <div className="mt-6">
      <h4 className="text-sm font-medium mb-2">Nivåfördelning i matchen</h4>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={gradeDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
              nameKey="grade"
            >
              {gradeDistribution.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={GRADE_COLORS[entry.grade] || '#8884d8'} 
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name, props) => {
                // Important: we need to use props.payload to access our custom data
                // props.payload contains the original data item
                return [`${props.payload.count} spelare (${props.payload.percentage}%)`, `Nivå ${props.payload.grade}`];
              }}
            />
            <Legend 
              formatter={(value, entry) => {
                // Get the original data from entry.payload
                const { payload } = entry;
                return `Nivå ${payload.grade}: ${payload.count} spelare (${payload.percentage}%)`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
