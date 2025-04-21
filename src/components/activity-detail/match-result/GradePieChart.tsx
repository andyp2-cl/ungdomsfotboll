
import React, { useMemo } from "react";
import { Activity, Player, PlayerGrade } from "@/types/player";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

interface GradePieChartProps {
  activity: Activity;
  participatingPlayers: Player[];
  compact?: boolean; // Added compact prop as optional boolean
}

export function GradePieChart({ activity, participatingPlayers, compact = false }: GradePieChartProps) {
  const isMobile = useIsMobile();
  
  // Calculate grade distribution
  const gradeDistribution = useMemo(() => {
    const grades: Record<PlayerGrade, number> = {
      'A': 0,
      'B': 0,
      'C': 0,
      'D': 0
    };
    
    // Only count non-coach players
    const nonCoachPlayers = participatingPlayers.filter(player => 
      !player.position?.includes('TRÄNARE')
    );
    
    nonCoachPlayers.forEach(player => {
      if (player.grade && grades[player.grade as PlayerGrade] !== undefined) {
        grades[player.grade as PlayerGrade]++;
      }
    });

    // Convert to array for recharts
    return Object.entries(grades).map(([grade, count]) => ({
      grade,
      count,
      percentage: nonCoachPlayers.length ? Math.round((count / nonCoachPlayers.length) * 100) : 0
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

  // Calculate chart size based on device and compact prop
  const chartSize = compact ? 20 : isMobile ? 30 : 40;

  // Custom label for the pie chart - smaller on mobile or in compact mode
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    
    // Smaller font when compact
    const fontSize = compact ? 6 : isMobile ? 8 : 10;
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize={fontSize}
        fontWeight="bold"
      >
        {`${gradeDistribution[index].grade}`}
      </text>
    );
  };

  return (
    <div className={`${compact ? 'h-[60px]' : 'h-[100px]'} w-full flex items-center justify-center`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={gradeDistribution}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={chartSize}
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
            formatter={(value, name, props: any) => {
              // Access our custom data through props.payload
              const payload = props.payload;
              return [`${payload.count} spelare (${payload.percentage}%)`, `Nivå ${payload.grade}`];
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
