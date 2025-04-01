import React, { useMemo } from "react";
import { Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface MatchesTabContentProps {
  activities: Activity[];
}

export function MatchesTabContent({ activities }: MatchesTabContentProps) {
  // Filtrera ut endast genomförda matcher (de som har ett resultat)
  const completedMatches = useMemo(() => {
    return activities.filter(a => a.type === 'match' && a.result);
  }, [activities]);
  
  // Calculate match statistics
  const matchStats = useMemo(() => {
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsScored = 0;
    let goalsConceded = 0;
    
    completedMatches.forEach(match => {
      // First check if isWin is explicitly set
      if (match.isWin !== undefined) {
        if (match.isWin) {
          wins++;
        } else if (match.homeScore === match.awayScore) {
          draws++;
        } else {
          losses++;
        }
      }
      // Otherwise calculate based on scores
      else if (match.result) {
        const [homeScore, awayScore] = match.result.split('-').map(Number);
        if (isNaN(homeScore) || isNaN(awayScore)) return;
        
        // Determine if we're home or away team
        const isHomeTeam = match.name.toLowerCase().includes('hässleholms if') && 
                         !match.name.toLowerCase().includes(' vs ') || 
                         match.name.toLowerCase().split(' vs ')[0].includes('hässleholms if');
        
        // Calculate our score and opponent score
        const ourScore = isHomeTeam ? homeScore : awayScore;
        const theirScore = isHomeTeam ? awayScore : homeScore;
        
        goalsScored += ourScore;
        goalsConceded += theirScore;
        
        if (ourScore > theirScore) {
          wins++;
        } else if (ourScore === theirScore) {
          draws++;
        } else {
          losses++;
        }
      }
    });
    
    return {
      total: completedMatches.length,
      wins,
      draws,
      losses,
      goalsScored,
      goalsConceded,
      goalDifference: goalsScored - goalsConceded,
      winPercentage: completedMatches.length > 0 ? Math.round((wins / completedMatches.length) * 100) : 0
    };
  }, [completedMatches]);
  
  // Format data for charts
  const matchResultData = [
    { name: 'Vinster', value: matchStats.wins, color: '#22c55e' },
    { name: 'Oavgjorda', value: matchStats.draws, color: '#64748b' },
    { name: 'Förluster', value: matchStats.losses, color: '#ef4444' }
  ];

  // Om det inte finns några genomförda matcher, visa ett meddelande
  if (completedMatches.length === 0) {
    return (
      <div className="p-4 bg-muted rounded-lg text-center">
        <p className="text-muted-foreground">Det finns inga genomförda matcher med resultat.</p>
      </div>
    );
  }

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
              <span className="font-medium">Gjorda mål:</span>
              <span>{matchStats.goalsScored}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-100 text-orange-800 rounded-md">
              <span className="font-medium">Insläppta mål:</span>
              <span>{matchStats.goalsConceded}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
