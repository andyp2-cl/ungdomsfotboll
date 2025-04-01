
import React, { useMemo } from "react";
import { Activity, Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ParticipationTabContentProps {
  activities: Activity[];
  players: Player[];
}

export function ParticipationTabContent({ activities, players }: ParticipationTabContentProps) {
  // Beräkna deltagande per spelare
  const playerParticipation = useMemo(() => {
    return players
      .filter(player => !player.positions?.includes("TRÄNARE"))
      .map(player => {
        const participatedActivities = activities.filter(activity => 
          activity.participants?.includes(player.id)
        );
        
        const matchesParticipated = participatedActivities.filter(a => 
          a.type === 'match'
        ).length;
        
        const cupsParticipated = participatedActivities.filter(a => 
          a.type === 'cup'
        ).length;
        
        return {
          playerId: player.id,
          name: player.name,
          grade: player.grade,
          totalActivities: participatedActivities.length,
          matches: matchesParticipated,
          cups: cupsParticipated,
          // Calculate percentage of total activities
          participationRate: activities.length > 0
            ? Math.round((participatedActivities.length / activities.length) * 100)
            : 0
        };
      })
      .sort((a, b) => b.totalActivities - a.totalActivities);
  }, [activities, players]);
  
  // Gruppera spelarna i deltagnivåer
  const participationGroups = useMemo(() => {
    const groups = [
      { name: '90-100%', value: 0, color: '#22c55e' },
      { name: '75-89%', value: 0, color: '#84cc16' },
      { name: '50-74%', value: 0, color: '#facc15' },
      { name: '25-49%', value: 0, color: '#fb923c' },
      { name: '0-24%', value: 0, color: '#ef4444' },
    ];
    
    players
      .filter(player => !player.positions?.includes("TRÄNARE"))
      .forEach(player => {
        const participatedActivities = activities.filter(activity => 
          activity.participants?.includes(player.id)
        ).length;
        
        const rate = activities.length > 0
          ? Math.round((participatedActivities / activities.length) * 100)
          : 0;
        
        if (rate >= 90) groups[0].value++;
        else if (rate >= 75) groups[1].value++;
        else if (rate >= 50) groups[2].value++;
        else if (rate >= 25) groups[3].value++;
        else groups[4].value++;
      });
    
    return groups;
  }, [activities, players]);
  
  // Calculate average participation for each grade
  const gradeParticipation = useMemo(() => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      
      <Card>
        <CardHeader>
          <CardTitle>Deltagandegrader</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={participationGroups}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {participationGroups.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} spelare`, '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Topplista deltagande</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <div className="grid grid-cols-5 font-semibold p-3 border-b">
              <div>Namn</div>
              <div className="text-center">Nivå</div>
              <div className="text-center">Aktiviteter</div>
              <div className="text-center">Matcher</div>
              <div className="text-center">Cuper</div>
            </div>
            <div className="divide-y">
              {playerParticipation.slice(0, 20).map(player => (
                <div key={player.playerId} className="grid grid-cols-5 p-3">
                  <div>{player.name}</div>
                  <div className="text-center">{player.grade}</div>
                  <div className="text-center font-semibold">{player.totalActivities}</div>
                  <div className="text-center">{player.matches}</div>
                  <div className="text-center">{player.cups}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
