
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Player } from "@/types/player";
import { sortPlayersByGrade } from "@/utils/gradeUtils";

interface DetailedMatchStatsProps {
  activities: Activity[];
  players: Player[];
  className?: string;
  onActivitySelect?: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
}

export function DetailedMatchStats({ 
  activities, 
  players, 
  className = "", 
  onActivitySelect,
  onPlayerSelect 
}: DetailedMatchStatsProps) {
  // Calculate player statistics from activities
  const playerStats = useMemo(() => {
    const stats = new Map<string, { name: string, matches: number, goals: number, playerId: string }>();
    
    // Initialize stats for all players
    players.forEach(player => {
      stats.set(player.id, {
        name: player.name,
        matches: 0,
        goals: 0,
        playerId: player.id
      });
    });
    
    // Count matches and goals
    activities.forEach(activity => {
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
      .filter(stat => stat.matches > 0)
      .sort((a, b) => b.goals - a.goals);
      
  }, [activities, players]);

  const handlePlayerClick = (playerStat: { name: string, matches: number, goals: number, playerId: string }) => {
    if (onPlayerSelect) {
      console.log("DetailedMatchStats: Player selected:", playerStat.playerId);
      onPlayerSelect(playerStat.playerId);
    }
  };

  const renderPlayerRow = (player: any, index: number) => (
    <div 
      key={index}
      className={`flex justify-between items-center p-3 rounded-md ${onPlayerSelect ? 'cursor-pointer hover:bg-muted' : ''}`}
      onClick={onPlayerSelect ? () => handlePlayerClick(player) : undefined}
    >
      <span className="font-medium">{player.name}</span>
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{player.goals}</span> mål
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{player.matches}</span> matcher
        </div>
      </div>
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Spelare med flest mål</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px]">
          <div className="p-6 space-y-2">
            {playerStats.map((player, index) => renderPlayerRow(player, index))}
            
            {playerStats.length === 0 && (
              <div className="py-4 text-center text-muted-foreground">
                Ingen måldata tillgänglig
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
