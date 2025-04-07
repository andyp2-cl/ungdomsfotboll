
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Player } from "@/types/player";
import { getGradeColor } from '@/utils/gradeUtils';

interface GradePieChartProps {
  activity: Activity;
  participatingPlayers: Player[];
}

interface GradeData {
  name: string;
  value: number;
  color: string;
}

export function GradePieChart({ activity, participatingPlayers }: GradePieChartProps) {
  // Group players by grade and count
  const gradeData: GradeData[] = participatingPlayers.reduce((acc, player) => {
    // Skip coaches
    if (player.positions?.includes("TRÄNARE")) return acc;
    
    const gradeIndex = acc.findIndex(item => item.name === player.grade);
    
    if (gradeIndex >= 0) {
      acc[gradeIndex].value += 1;
    } else {
      acc.push({
        name: player.grade,
        value: 1,
        color: getGradeColor(player.grade)
      });
    }
    
    return acc;
  }, [] as GradeData[]);
  
  // Sort by grade
  gradeData.sort((a, b) => a.name.localeCompare(b.name));
  
  if (gradeData.length === 0) {
    return null;
  }
  
  // Calculate total players for percentage
  const totalPlayers = gradeData.reduce((sum, item) => sum + item.value, 0);
  
  // Custom tooltip to show percentage
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = Math.round((data.value / totalPlayers) * 100);
      
      return (
        <div className="bg-background p-2 border rounded shadow-sm">
          <p className="font-medium">{`Nivå ${data.name}`}</p>
          <p>{`${data.value} spelare (${percentage}%)`}</p>
        </div>
      );
    }
    
    return null;
  };
  
  // Format legend items
  const renderLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-2">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <span>{`${entry.value} (${Math.round((entry.payload.value / totalPlayers) * 100)}%)`}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Card className="mt-4">
      <CardContent className="pt-4">
        <CardTitle className="text-base mb-2 text-center">Fördelning spelarnivå</CardTitle>
        <CardDescription className="text-center mb-4">
          Matchens spelarfördelning per nivå
        </CardDescription>
        
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={gradeData}
                cx="50%"
                cy="50%"
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {gradeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend
                content={renderLegend}
                verticalAlign="bottom"
                align="center"
              />
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
