
import React, { useMemo } from "react";
import { Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, ResponsiveContainer, Tooltip, Legend, Cell } from "recharts";

interface MatchesTabContentProps {
  activities: Activity[];
}

export function MatchesTabContent({ activities }: MatchesTabContentProps) {
  // Calculate match statistics
  const matchStats = useMemo(() => {
    const matches = activities.filter(a => a.type === 'match');
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsScored = 0;
    let goalsConceded = 0;
    
    matches.forEach(match => {
      if (!match.result) return;
      
      const [ourScore, theirScore] = match.result.split('-').map(Number);
      if (isNaN(ourScore) || isNaN(theirScore)) return;
      
      goalsScored += ourScore;
      goalsConceded += theirScore;
      
      if (ourScore > theirScore) wins++;
      else if (ourScore === theirScore) draws++;
      else losses++;
    });
    
    return {
      total: matches.length,
      wins,
      draws,
      losses,
      goalsScored,
      goalsConceded,
      goalDifference: goalsScored - goalsConceded,
      winPercentage: matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0
    };
  }, [activities]);
  
  // Format data for charts
  const matchResultData = [
    { name: 'Vinster', value: matchStats.wins, color: '#22c55e' },
    { name: 'Oavgjorda', value: matchStats.draws, color: '#64748b' },
    { name: 'Förluster', value: matchStats.losses, color: '#ef4444' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="text-2xl font-bold">{matchStats.goalDifference}</div>
              <div className="text-sm text-muted-foreground">Målskillnad</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Detaljerad matchstatistik</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted rounded-md">
              <span className="font-medium">Totalt antal matcher:</span>
              <span>{matchStats.total}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-100 text-green-800 rounded-md">
              <span className="font-medium">Vinster:</span>
              <span>{matchStats.wins}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-100 text-gray-800 rounded-md">
              <span className="font-medium">Oavgjorda:</span>
              <span>{matchStats.draws}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-100 text-red-800 rounded-md">
              <span className="font-medium">Förluster:</span>
              <span>{matchStats.losses}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-100 text-blue-800 rounded-md">
              <span className="font-medium">Matcher utan resultat:</span>
              <span>{matchStats.total - (matchStats.wins + matchStats.draws + matchStats.losses)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
