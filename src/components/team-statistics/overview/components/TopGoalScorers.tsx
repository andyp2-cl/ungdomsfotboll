
import React, { useMemo } from 'react';
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface TopGoalScorersProps {
  matches: Activity[];
  players: Player[];
  onPlayerClick?: (playerId: string) => void;
}

export function TopGoalScorers({ matches, players, onPlayerClick }: TopGoalScorersProps) {
  // Calculate top goal scorers
  const topGoalScorers = useMemo(() => {
    // Calculate player statistics from activities
    const stats = new Map<string, { name: string, matches: number, goals: number }>();
    
    // Initialize stats for all players
    players.forEach(player => {
      stats.set(player.id, {
        name: player.name,
        matches: 0,
        goals: 0
      });
    });
    
    // Count matches and goals
    matches.forEach(activity => {
      // Count participations as matches
      activity.participants?.forEach(playerId => {
        const playerStat = stats.get(playerId);
        if (playerStat) {
          playerStat.matches += 1;
        }
      });
      
      // Count goals if available in player_stats
      if (activity.player_stats?.goals) {
        Object.entries(activity.player_stats.goals).forEach(([playerId, goals]) => {
          const playerStat = stats.get(playerId);
          if (playerStat) {
            playerStat.goals += goals;
          }
        });
      }
    });
    
    // Convert to array and sort by goals
    return Array.from(stats.values())
      .filter(stat => stat.goals > 0)
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 10);
  }, [matches, players]);

  const handlePlayerClick = (name: string) => {
    if (onPlayerClick) {
      const selectedPlayer = players.find(p => p.name === name);
      if (selectedPlayer) {
        onPlayerClick(selectedPlayer.id);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          Spelare med flest mål
        </CardTitle>
        <CardDescription>Målstatistik för de bästa målskyttarna</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 h-[280px] overflow-y-auto">
        {topGoalScorers.map((player, index) => (
          <div 
            key={index}
            className={`flex justify-between items-center p-3 rounded-md ${index % 2 === 0 ? 'bg-slate-50' : ''} ${onPlayerClick ? 'cursor-pointer hover:bg-muted' : ''}`}
            onClick={onPlayerClick ? () => handlePlayerClick(player.name) : undefined}
          >
            <div className="flex items-center">
              <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full text-xs font-bold mr-2">
                {index + 1}
              </span>
              <span className="font-medium">{player.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="font-medium text-green-600">{player.goals}</span> mål
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">{player.matches}</span> matcher
              </div>
              <div className="text-sm text-blue-600">
                {player.matches > 0 ? (player.goals / player.matches).toFixed(1) : "0"} mål/match
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
