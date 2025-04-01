
import React from "react";
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface TopScorersChartProps {
  playerStats: Array<{
    playerId: string;
    name: string;
    goals: number;
    assists: number;
    matches: number;
  }>;
}

export function TopScorersChart({ playerStats }: TopScorersChartProps) {
  const topScorers = playerStats.slice(0, 15);
  
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Topp målskyttar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topScorers}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 70
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={70}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [value, name === "goals" ? "Mål" : "Assist"]}
                labelFormatter={(label) => `${label}`}
              />
              <Legend 
                formatter={(value) => value === "goals" ? "Mål" : "Assist"} 
              />
              <Bar dataKey="goals" name="goals" fill="#22c55e" />
              <Bar dataKey="assists" name="assists" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
