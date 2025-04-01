
import React, { useMemo } from "react";
import { Player, Activity, PlayerGrade } from "@/types/player";
import { TeamStatistics } from "@/components/TeamStatistics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell, PieChart, Pie } from "recharts";
import { getGradeColor } from "@/utils/gradeUtils";

interface StatisticsTabContentProps {
  players: Player[];
  activities: Activity[];
  gradeData: { grade: string; players: number }[];
}

export function StatisticsTabContent({ 
  players, 
  activities,
  gradeData
}: StatisticsTabContentProps) {
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
  
  // Get player participation by grade
  const participationByGrade = useMemo(() => {
    const gradeParticipation: Record<PlayerGrade, { 
      grade: string, 
      players: number, 
      activities: number,
      averageActivities: number,
      color: string 
    }> = {
      'A': { grade: 'A', players: 0, activities: 0, averageActivities: 0, color: getGradeColor('A') },
      'B': { grade: 'B', players: 0, activities: 0, averageActivities: 0, color: getGradeColor('B') },
      'C': { grade: 'C', players: 0, activities: 0, averageActivities: 0, color: getGradeColor('C') },
      'D': { grade: 'D', players: 0, activities: 0, averageActivities: 0, color: getGradeColor('D') }
    };
    
    players.forEach(player => {
      if (player.grade in gradeParticipation) {
        gradeParticipation[player.grade].players++;
        gradeParticipation[player.grade].activities += player.activities?.length || 0;
      }
    });
    
    // Calculate average activities per player in each grade
    Object.keys(gradeParticipation).forEach(grade => {
      const key = grade as PlayerGrade;
      if (gradeParticipation[key].players > 0) {
        gradeParticipation[key].averageActivities = 
          Math.round((gradeParticipation[key].activities / gradeParticipation[key].players) * 10) / 10;
      }
    });
    
    return Object.values(gradeParticipation);
  }, [players]);
  
  // Format data for charts
  const matchResultData = [
    { name: 'Vinster', value: matchStats.wins, color: '#22c55e' },
    { name: 'Oavgjorda', value: matchStats.draws, color: '#64748b' },
    { name: 'Förluster', value: matchStats.losses, color: '#ef4444' }
  ];
  
  const goalData = [
    { name: 'Gjorda mål', value: matchStats.goalsScored, color: '#22c55e' },
    { name: 'Insläppta mål', value: matchStats.goalsConceded, color: '#ef4444' }
  ];
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Översikt</TabsTrigger>
          <TabsTrigger value="matches">Matcher</TabsTrigger>
          <TabsTrigger value="goals">Mål</TabsTrigger>
          <TabsTrigger value="participation">Deltagare</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <TeamStatistics players={players} activities={activities} />
        </TabsContent>
        
        <TabsContent value="matches">
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
        </TabsContent>
        
        <TabsContent value="goals">
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
                      <Legend />
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
        </TabsContent>
        
        <TabsContent value="participation">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Deltagande per nivå</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={participationByGrade}>
                      <XAxis dataKey="grade" />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [value, name === 'players' ? 'Antal spelare' : 'Snitt aktiviteter']} />
                      <Legend payload={[
                        { value: 'Antal spelare', type: 'square', color: '#64748b' },
                        { value: 'Snitt aktiviteter', type: 'square', color: '#3b82f6' }
                      ]} />
                      <Bar dataKey="players" name="Antal spelare" fill="#64748b" />
                      <Bar dataKey="averageActivities" name="Snitt aktiviteter" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Detaljerad nivåstatistik</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {participationByGrade.map(grade => (
                    <div key={grade.grade} className="p-3 border rounded-md">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Nivå {grade.grade}</span>
                        <span>{grade.players} spelare</span>
                      </div>
                      <div className="flex justify-between mb-2 text-sm">
                        <span>Antal aktiviteter:</span>
                        <span>{grade.activities}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Genomsnitt per spelare:</span>
                        <span>{grade.averageActivities}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div 
                          className="h-2.5 rounded-full" 
                          style={{ 
                            width: `${Math.min(100, grade.averageActivities * 10)}%`,
                            backgroundColor: grade.color
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
