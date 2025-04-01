
import React from 'react';
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PerformanceTabContentProps {
  players: Player[];
  activities: Activity[];
  playerStats: any[]; // Using any for now but this should be properly typed
  onPlayerClick: (playerId: string) => void;
}

export function PerformanceTabContent({ players, activities, playerStats, onPlayerClick }: PerformanceTabContentProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Mål & Assist</CardTitle>
          <CardDescription>Mål och assist per spelare</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full overflow-y-auto pr-4">
            <table className="w-full">
              <thead className="sticky top-0 bg-background">
                <tr className="border-b text-left">
                  <th className="pb-2">Spelare</th>
                  <th className="pb-2 text-center">Matcher</th>
                  <th className="pb-2 text-center">Mål</th>
                  <th className="pb-2 text-center">Assist</th>
                  <th className="pb-2 text-center">Poäng</th>
                </tr>
              </thead>
              <tbody>
                {playerStats
                  .filter(player => player.matchCount > 0)
                  .sort((a, b) => (b.goals + b.assists) - (a.goals + a.assists))
                  .map(player => (
                    <tr 
                      key={player.id} 
                      className="border-b hover:bg-accent/5 cursor-pointer"
                      onClick={() => onPlayerClick(player.id)}
                    >
                      <td className="py-2">{player.name}</td>
                      <td className="py-2 text-center">{player.matchCount}</td>
                      <td className="py-2 text-center">{player.goals}</td>
                      <td className="py-2 text-center">{player.assists}</td>
                      <td className="py-2 text-center">{player.goals + player.assists}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Vinststatistik</CardTitle>
          <CardDescription>Vinster och vinstprocent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full overflow-y-auto pr-4">
            <table className="w-full">
              <thead className="sticky top-0 bg-background">
                <tr className="border-b text-left">
                  <th className="pb-2">Spelare</th>
                  <th className="pb-2 text-center">Matcher</th>
                  <th className="pb-2 text-center">Vinster</th>
                  <th className="pb-2 text-center">Vinstprocent</th>
                </tr>
              </thead>
              <tbody>
                {playerStats
                  .filter(player => player.matchCount >= 3) // Only show players with at least 3 matches
                  .sort((a, b) => b.winRate - a.winRate)
                  .map(player => (
                    <tr 
                      key={player.id} 
                      className="border-b hover:bg-accent/5 cursor-pointer"
                      onClick={() => onPlayerClick(player.id)}
                    >
                      <td className="py-2">{player.name}</td>
                      <td className="py-2 text-center">{player.matchCount}</td>
                      <td className="py-2 text-center">{player.winCount}</td>
                      <td className="py-2 text-center">{player.winRate}%</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
