
import React, { useMemo } from "react";
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface GoalsTabContentProps {
  players: Player[];
  activities: Activity[];
}

export function GoalsTabContent({ players, activities }: GoalsTabContentProps) {
  // Calculate match statistics for goals
  const matchStats = useMemo(() => {
    const matches = activities.filter(a => a.type === 'match');
    let goalsScored = 0;
    let goalsConceded = 0;
    
    matches.forEach(match => {
      if (!match.result) return;
      
      const [ourScore, theirScore] = match.result.split('-').map(Number);
      if (isNaN(ourScore) || isNaN(theirScore)) return;
      
      goalsScored += ourScore;
      goalsConceded += theirScore;
    });
    
    return {
      total: matches.length,
      goalsScored,
      goalsConceded
    };
  }, [activities]);
  
  // Format data for charts
  const goalData = [
    { name: 'Gjorda mål', value: matchStats.goalsScored, color: '#22c55e' },
    { name: 'Insläppta mål', value: matchStats.goalsConceded, color: '#ef4444' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Målstatistik</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={goalData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} mål`, '']} />
                <Bar dataKey="value" name="Mål">
                  {goalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-3 border rounded-md">
              <div className="text-2xl font-bold">{matchStats.goalsScored}</div>
              <div className="text-sm text-muted-foreground">Gjorda mål</div>
            </div>
            <div className="text-center p-3 border rounded-md">
              <div className="text-2xl font-bold">{matchStats.goalsConceded}</div>
              <div className="text-sm text-muted-foreground">Insläppta mål</div>
            </div>
            <div className="text-center p-3 border rounded-md">
              <div className="text-2xl font-bold">{matchStats.total > 0 ? (matchStats.goalsScored / matchStats.total).toFixed(1) : '0'}</div>
              <div className="text-sm text-muted-foreground">Mål per match</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Topp målgörare</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {players
              .map(player => {
                let totalGoals = 0;
                
                activities.forEach(activity => {
                  if (activity.type === 'match' && activity.player_stats?.goals) {
                    totalGoals += activity.player_stats.goals[player.id] || 0;
                  }
                });
                
                return {
                  id: player.id,
                  name: player.name,
                  grade: player.grade,
                  goals: totalGoals
                };
              })
              .filter(player => player.goals > 0)
              .sort((a, b) => b.goals - a.goals)
              .slice(0, 10)
              .map((player, index) => (
                <div key={player.id} className="flex justify-between items-center p-3 border rounded-md">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{index + 1}.</span>
                    <span>{player.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">Nivå {player.grade}</span>
                  </div>
                  <span className="font-bold">{player.goals} mål</span>
                </div>
              ))}
              
              {players.filter(p => {
                let hasGoals = false;
                activities.forEach(a => {
                  if (a.player_stats?.goals && a.player_stats.goals[p.id]) hasGoals = true;
                });
                return hasGoals;
              }).length === 0 && (
                <div className="text-center p-4 text-muted-foreground">
                  Inga målstatistik registrerad än
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
