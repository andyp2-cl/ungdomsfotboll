
import React, { useMemo } from "react";
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';
import { getGradeColor } from '@/utils/gradeUtils';

interface GoalsTabContentProps {
  players: Player[];
  activities: Activity[];
}

export function GoalsTabContent({ players, activities }: GoalsTabContentProps) {
  // Beräkna målstatistik för spelare
  const goalStats = useMemo(() => {
    // Filtrera bara matcher
    const matches = activities.filter(a => a.type === 'match');
    
    // Skapa ett objekt för att spåra mål och assist per spelare
    const playerStats = players.reduce((acc, player) => {
      acc[player.id] = { 
        id: player.id,
        name: player.name,
        grade: player.grade,
        goals: 0,
        assists: 0,
        matches: 0
      };
      return acc;
    }, {} as Record<string, {
      id: string;
      name: string;
      grade: string;
      goals: number;
      assists: number;
      matches: number;
    }>);
    
    // Räkna mål, assist och matcher för varje spelare
    matches.forEach(match => {
      if (match.player_stats?.goals) {
        Object.entries(match.player_stats.goals).forEach(([playerId, goals]) => {
          if (playerStats[playerId]) {
            playerStats[playerId].goals += Number(goals);
          }
        });
      }
      
      if (match.player_stats?.assists) {
        Object.entries(match.player_stats.assists).forEach(([playerId, assists]) => {
          if (playerStats[playerId]) {
            playerStats[playerId].assists += Number(assists);
          }
        });
      }
      
      // Räkna matcher för deltagare
      match.participants?.forEach(playerId => {
        if (playerStats[playerId]) {
          playerStats[playerId].matches++;
        }
      });
    });
    
    // Konvertera till array och filtrera bort spelare utan aktivitet
    return Object.values(playerStats)
      .filter(player => player.goals > 0 || player.assists > 0)
      .sort((a, b) => b.goals - a.goals || b.assists - a.assists);
  }, [players, activities]);

  // Beräkna totala mål och assist
  const totals = useMemo(() => {
    const totalGoals = goalStats.reduce((sum, player) => sum + player.goals, 0);
    const totalAssists = goalStats.reduce((sum, player) => sum + player.assists, 0);
    
    return { totalGoals, totalAssists };
  }, [goalStats]);

  // Skapa data för målskytt-diagram
  const topScorers = goalStats.slice(0, 10);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Målskyttar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topScorers}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === "Mål") return [`${value} mål`, name];
                    return [`${value} assist`, name];
                  }}
                  labelFormatter={(label) => {
                    const player = topScorers.find(p => p.name === label);
                    return `${player?.name} (Nivå ${player?.grade})`;
                  }}
                />
                <Bar dataKey="goals" name="Mål">
                  {topScorers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getGradeColor(entry.grade)} />
                  ))}
                  <LabelList dataKey="goals" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Assists</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topScorers.slice(0, 10).sort((a, b) => b.assists - a.assists)}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} assist`, "Assist"]}
                  labelFormatter={(label) => {
                    const player = topScorers.find(p => p.name === label);
                    return `${player?.name} (Nivå ${player?.grade})`;
                  }}
                />
                <Bar dataKey="assists" name="Assist" fill="#8884d8">
                  {topScorers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#8884d8" />
                  ))}
                  <LabelList dataKey="assists" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Detaljerad målstatistik</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-left">Spelare</th>
                  <th className="p-2 text-left">Nivå</th>
                  <th className="p-2 text-center">Matcher</th>
                  <th className="p-2 text-center">Mål</th>
                  <th className="p-2 text-center">Assist</th>
                  <th className="p-2 text-center">Poäng</th>
                  <th className="p-2 text-center">Mål/match</th>
                </tr>
              </thead>
              <tbody>
                {goalStats.map((player, index) => (
                  <tr key={player.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="p-2 font-medium">{player.name}</td>
                    <td className="p-2">{player.grade}</td>
                    <td className="p-2 text-center">{player.matches}</td>
                    <td className="p-2 text-center font-bold">{player.goals}</td>
                    <td className="p-2 text-center">{player.assists}</td>
                    <td className="p-2 text-center">{player.goals + player.assists}</td>
                    <td className="p-2 text-center">
                      {player.matches > 0 
                        ? (player.goals / player.matches).toFixed(1) 
                        : "0.0"}
                    </td>
                  </tr>
                ))}
                <tr className="bg-primary/10 font-bold">
                  <td className="p-2" colSpan={3}>Total</td>
                  <td className="p-2 text-center">{totals.totalGoals}</td>
                  <td className="p-2 text-center">{totals.totalAssists}</td>
                  <td className="p-2 text-center">{totals.totalGoals + totals.totalAssists}</td>
                  <td className="p-2 text-center"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
