
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Player, Activity } from "@/types/player";

interface GradeParticipationChartProps {
  players: Player[];
  activities: Activity[];
}

export function GradeParticipationChart({ players, activities }: GradeParticipationChartProps) {
  // Calculate average participation for each grade
  const gradeParticipation = React.useMemo(() => {
    const gradeMap = new Map<string, { grade: string, players: number, totalActivities: number }>();
    
    players.forEach(player => {
      if (player.positions?.includes("TRÄNARE")) return;
      
      const grade = player.grade;
      const participatedActivities = activities.filter(activity => 
        activity.participants?.includes(player.id)
      ).length;
      
      if (!gradeMap.has(grade)) {
        gradeMap.set(grade, { grade, players: 0, totalActivities: 0 });
      }
      
      const gradeStats = gradeMap.get(grade)!;
      gradeStats.players++;
      gradeStats.totalActivities += participatedActivities;
    });
    
    return Array.from(gradeMap.values())
      .map(stats => ({
        ...stats,
        averageActivities: stats.players > 0 
          ? Math.round((stats.totalActivities / stats.players) * 10) / 10
          : 0
      }))
      .sort((a, b) => a.grade.localeCompare(b.grade));
  }, [activities, players]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deltagande per nivå</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={gradeParticipation}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="grade" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  value, 
                  name === "averageActivities" 
                    ? "Genomsnitt per spelare" 
                    : name === "players" 
                      ? "Antal spelare"
                      : "Alla aktiviteter"
                ]}
              />
              <Legend formatter={(value) => 
                value === "averageActivities"
                  ? "Genomsnitt per spelare"
                  : "Antal spelare"
              }/>
              <Bar dataKey="averageActivities" fill="#3b82f6" />
              <Bar dataKey="players" fill="#64748b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
