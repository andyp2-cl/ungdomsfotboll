
import React, { useMemo } from "react";
import { Activity, Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { calculateGoalStats } from "./goals/calculateGoalStats";

interface MatchesTabContentProps {
  activities: Activity[];
  players?: Player[];
}

export function MatchesTabContent({ activities, players = [] }: MatchesTabContentProps) {
  // Filter out only completed matches (those with a result)
  const completedMatches = useMemo(() => {
    return activities.filter(a => a.type === 'match' && a.result);
  }, [activities]);
  
  // Get goal statistics from the same function used in GoalsTabContent
  const { totalStats } = useMemo(() => 
    calculateGoalStats(activities, players), 
    [activities, players]
  );
  
  // Calculate match statistics
  const matchStats = useMemo(() => {
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsScored = 0;
    let cleanSheets = 0;
    let comebackWins = 0;
    let homeWins = 0;
    let awayWins = 0;
    
    completedMatches.forEach(match => {
      // First check if isWin is explicitly set
      if (match.isWin === true) {
        wins++;
      } else if (match.isWin === false) {
        losses++;
      } else if (match.homeScore !== undefined && match.awayScore !== undefined && 
                match.homeScore === match.awayScore) {
        draws++;
      }
      
      // Calculate our score and opponent score
      if (match.homeScore !== undefined && match.awayScore !== undefined) {
        // Determine if we're home or away team
        const isHomeTeam = match.name.toLowerCase().includes('hässleholms if') && 
                         !match.name.toLowerCase().includes(' vs ') || 
                         match.name.toLowerCase().split(' vs ')[0].includes('hässleholms if');
        
        // goalsScored is always OUR goals (Hässleholms IF)
        // goalsConceded is always THEIR goals (opponent)
        const ourScore = isHomeTeam ? match.homeScore : match.awayScore;
        const theirScore = isHomeTeam ? match.awayScore : match.homeScore;
        
        goalsScored += ourScore;
        
        // Clean sheets - matches where we conceded 0 goals
        if (theirScore === 0) {
          cleanSheets++;
        }
        
        // Count home/away wins
        if (match.isWin === true) {
          if (isHomeTeam) {
            homeWins++;
          } else {
            awayWins++;
          }
          
          // Comeback wins - we won despite conceding first
          // This is an approximation since we don't have timeline data
          if (theirScore > 0) {
            comebackWins++;
          }
        }
      }
    });
    
    return {
      total: completedMatches.length,
      wins,
      draws,
      losses,
      goalsScored: totalStats.goals, // Fix: Use 'goals' instead of 'totalGoals'
      cleanSheets,
      comebackWins,
      homeWins,
      awayWins,
      winPercentage: completedMatches.length > 0 ? Math.round((wins / completedMatches.length) * 100) : 0
    };
  }, [completedMatches, totalStats]);
  
  // Format data for charts
  const matchResultData = [
    { name: 'Vinster', value: matchStats.wins, color: '#22c55e' },
    { name: 'Oavgjorda', value: matchStats.draws, color: '#64748b' },
    { name: 'Förluster', value: matchStats.losses, color: '#ef4444' }
  ];

  // If there are no completed matches, show a message
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
              <div className="text-2xl font-bold">{matchStats.homeWins}-{matchStats.awayWins}</div>
              <div className="text-sm text-muted-foreground">Hemma-Borta V</div>
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
            <div className="flex justify-between items-center p-3 bg-emerald-100 text-emerald-800 rounded-md">
              <span className="font-medium">Hållna nollor:</span>
              <span>{matchStats.cleanSheets}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-100 text-purple-800 rounded-md">
              <span className="font-medium">Comeback-vinster:</span>
              <span>{matchStats.comebackWins}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
