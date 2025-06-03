
import React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { Player } from "@/types/player";

interface PlayerLevelRadarChartProps {
  participants: Player[];
  size?: "small" | "medium";
}

export function PlayerLevelRadarChart({ participants, size = "small" }: PlayerLevelRadarChartProps) {
  // Count players by grade
  const gradeCounts = participants.reduce((acc, player) => {
    const grade = player.grade || 'Övrig';
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Prepare data for radar chart
  const data = [
    { grade: 'A', count: gradeCounts['A'] || 0, fullMark: Math.max(5, Math.max(...Object.values(gradeCounts), 0)) },
    { grade: 'B', count: gradeCounts['B'] || 0, fullMark: Math.max(5, Math.max(...Object.values(gradeCounts), 0)) },
    { grade: 'C', count: gradeCounts['C'] || 0, fullMark: Math.max(5, Math.max(...Object.values(gradeCounts), 0)) },
    { grade: 'D', count: gradeCounts['D'] || 0, fullMark: Math.max(5, Math.max(...Object.values(gradeCounts), 0)) },
    { grade: 'Övrig', count: gradeCounts['Övrig'] || 0, fullMark: Math.max(5, Math.max(...Object.values(gradeCounts), 0)) }
  ];

  const chartSize = size === "small" ? 80 : 120;

  if (participants.length === 0) {
    return (
      <div className={`${size === "small" ? "w-20 h-20" : "w-30 h-30"} flex items-center justify-center text-xs text-muted-foreground`}>
        Ingen data
      </div>
    );
  }

  return (
    <div className={`${size === "small" ? "w-20 h-20" : "w-30 h-30"}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis 
            dataKey="grade" 
            tick={{ fontSize: size === "small" ? 8 : 10, fill: '#64748b' }}
            className="text-xs"
          />
          <Radar
            name="Spelare"
            dataKey="count"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.3}
            strokeWidth={1.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
