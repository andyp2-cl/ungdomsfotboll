
import React from 'react';
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface StatsTabContentProps {
  player: Player;
  matches: Activity[];
}

export function StatsTabContent({ player, matches }: StatsTabContentProps) {
  // Calculate total goals and assists
  const totalGoals = matches.reduce((sum, match) => {
    const playerGoals = match.player_stats?.goals?.[player.id] || 0;
    return sum + playerGoals;
  }, 0);
  
  const totalAssists = matches.reduce((sum, match) => {
    const playerAssists = match.player_stats?.assists?.[player.id] || 0;
    return sum + playerAssists;
  }, 0);
  
  // Calculate win ratio
  const wins = matches.filter(match => match.isWin === true).length;
  const losses = matches.filter(match => match.isWin === false).length;
  const draws = matches.filter(match => 
    match.homeScore !== undefined && 
    match.awayScore !== undefined && 
    match.homeScore === match.awayScore
  ).length;
  
  const totalMatchesWithResult = wins + losses + draws;
  const winRatio = totalMatchesWithResult > 0 
    ? Math.round((wins / totalMatchesWithResult) * 100) 
    : 0;
  
  // Calculate average goals per match
  const goalsPerMatch = matches.length > 0 
    ? (totalGoals / matches.length).toFixed(1)
    : '0';
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Målstatistik</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center">
              <div className="text-2xl font-bold">{totalGoals}</div>
              <div className="text-sm text-muted-foreground">Mål</div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="text-2xl font-bold">{totalAssists}</div>
              <div className="text-sm text-muted-foreground">Assist</div>
            </div>
          </div>
          <Separator className="my-3" />
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-muted-foreground">Mål per match:</span>
              <span className="text-sm font-medium">{goalsPerMatch}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Poäng per match:</span>
              <span className="text-sm font-medium">
                {matches.length > 0 
                  ? ((totalGoals + totalAssists) / matches.length).toFixed(1)
                  : '0'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Matchstatistik</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center justify-center py-2 bg-green-50 rounded-md">
              <div className="text-xl font-bold text-green-700">{wins}</div>
              <div className="text-xs text-green-600">Vinster</div>
            </div>
            <div className="flex flex-col items-center justify-center py-2 bg-yellow-50 rounded-md">
              <div className="text-xl font-bold text-yellow-700">{draws}</div>
              <div className="text-xs text-yellow-600">Oavgjorda</div>
            </div>
            <div className="flex flex-col items-center justify-center py-2 bg-red-50 rounded-md">
              <div className="text-xl font-bold text-red-700">{losses}</div>
              <div className="text-xs text-red-600">Förluster</div>
            </div>
          </div>
          <Separator className="my-3" />
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-muted-foreground">Vinstprocent:</span>
              <span className="text-sm font-medium">{winRatio}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Matcher spelade:</span>
              <span className="text-sm font-medium">{matches.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
