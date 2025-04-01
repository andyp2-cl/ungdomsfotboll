
import React, { useMemo } from "react";
import { Activity, Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface GoalsTabContentProps {
  activities: Activity[];
  players: Player[];
}

export function GoalsTabContent({ activities, players }: GoalsTabContentProps) {
  // Beräkna målstatistik
  const playerStats = useMemo(() => {
    const matches = activities.filter(a => a.type === 'match');
    const stats = new Map<string, { playerId: string, name: string, goals: number, assists: number, matches: number }>();
    
    // Initiera alla spelare
    players.forEach(player => {
      if (!player.positions?.includes("TRÄNARE")) {
        stats.set(player.id, {
          playerId: player.id,
          name: player.name,
          goals: 0,
          assists: 0,
          matches: 0
        });
      }
    });
    
    // Gå igenom alla matcher och räkna mål och assist
    matches.forEach(match => {
      if (!match.player_stats) return;
      
      // Räkna deltagande
      match.participants?.forEach(playerId => {
        const playerStat = stats.get(playerId);
        if (playerStat) {
          playerStat.matches += 1;
        }
      });
      
      // Räkna mål
      if (match.player_stats.goals) {
        Object.entries(match.player_stats.goals).forEach(([playerId, goals]) => {
          const playerStat = stats.get(playerId);
          if (playerStat) {
            playerStat.goals += goals as number;
          }
        });
      }
      
      // Räkna assist
      if (match.player_stats.assists) {
        Object.entries(match.player_stats.assists).forEach(([playerId, assists]) => {
          const playerStat = stats.get(playerId);
          if (playerStat) {
            playerStat.assists += assists as number;
          }
        });
      }
    });
    
    // Konvertera till array och sortera efter flest mål
    return Array.from(stats.values())
      .filter(stat => stat.matches > 0) // Bara de som spelat någon match
      .sort((a, b) => b.goals - a.goals);
  }, [activities, players]);
  
  const topScorers = playerStats.slice(0, 15);
  
  // Beräkna total
  const totalStats = useMemo(() => {
    const goals = playerStats.reduce((sum, p) => sum + p.goals, 0);
    const assists = playerStats.reduce((sum, p) => sum + p.assists, 0);
    
    return { goals, assists };
  }, [playerStats]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      
      <Card>
        <CardHeader>
          <CardTitle>Detaljerad målstatistik</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="p-4 bg-green-50 text-green-700 rounded-md text-center">
                <div className="text-xl font-bold">{totalStats.goals}</div>
                <div className="text-sm">Totalt antal mål</div>
              </div>
              <div className="p-4 bg-blue-50 text-blue-700 rounded-md text-center">
                <div className="text-xl font-bold">{totalStats.assists}</div>
                <div className="text-sm">Totalt antal assist</div>
              </div>
              <div className="p-4 bg-gray-50 text-gray-700 rounded-md text-center">
                <div className="text-xl font-bold">{playerStats.length}</div>
                <div className="text-sm">Aktiva spelare</div>
              </div>
            </div>
            
            <div className="border rounded-md mt-4">
              <div className="grid grid-cols-4 font-semibold p-3 border-b">
                <div>Namn</div>
                <div className="text-center">Matcher</div>
                <div className="text-center">Mål</div>
                <div className="text-center">Assist</div>
              </div>
              <div className="divide-y">
                {playerStats.slice(0, 20).map(player => (
                  <div key={player.playerId} className="grid grid-cols-4 p-3">
                    <div>{player.name}</div>
                    <div className="text-center">{player.matches}</div>
                    <div className="text-center text-green-600 font-semibold">{player.goals}</div>
                    <div className="text-center text-blue-600 font-semibold">{player.assists}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Matcher per målskytt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topScorers.slice(0, 10).map(p => ({
                  name: p.name,
                  goalsPerMatch: p.matches > 0 ? Number((p.goals / p.matches).toFixed(2)) : 0
                }))}
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
                  formatter={(value) => [`${value} mål/match`, ""]}
                />
                <Bar dataKey="goalsPerMatch" name="Mål per match" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
