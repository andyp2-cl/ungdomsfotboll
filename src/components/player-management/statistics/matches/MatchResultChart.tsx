
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface MatchResultChartProps {
  matchStats: {
    total: number;
    wins: number;
    draws: number;
    losses: number;
    winPercentage: number;
    homeWins: number;
    awayWins: number;
  };
}

export function MatchResultChart({ matchStats }: MatchResultChartProps) {
  // Format data for charts
  const matchResultData = [
    { name: 'Vinster', value: matchStats.wins, color: '#22c55e' },
    { name: 'Oavgjorda', value: matchStats.draws, color: '#64748b' },
    { name: 'Förluster', value: matchStats.losses, color: '#ef4444' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matchresultat</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={matchResultData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {matchResultData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value} matcher`, '']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-3 border rounded-md">
            <div className="text-2xl font-bold">{matchStats.total}</div>
            <div className="text-sm text-muted-foreground">Matcher</div>
          </div>
          <div className="text-center p-3 border rounded-md">
            <div className="text-2xl font-bold">{matchStats.winPercentage}%</div>
            <div className="text-sm text-muted-foreground">Vinstprocent</div>
          </div>
          <div className="text-center p-3 border rounded-md">
            <div className="text-2xl font-bold">{matchStats.homeWins}-{matchStats.awayWins}</div>
            <div className="text-sm text-muted-foreground">Hemma-Borta V</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
