
import React from "react";
import { Activity, Player } from "@/types/player";
import { Badge } from "@/components/ui/badge";
import { Target, Users, Award } from "lucide-react";

interface GoalAssistDisplayProps {
  activity: Activity;
  players: Player[];
  compact?: boolean;
}

export function GoalAssistDisplay({ activity, players, compact = false }: GoalAssistDisplayProps) {
  const goals = activity.player_stats?.goals || {};
  const assists = activity.player_stats?.assists || {};
  
  // Get ALL scorers and assisters (removed the slice limit)
  const topScorers = Object.entries(goals)
    .filter(([_, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([playerId, count]) => ({
      player: players.find(p => p.id === playerId),
      count
    }))
    .filter(item => item.player);

  const topAssisters = Object.entries(assists)
    .filter(([_, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([playerId, count]) => ({
      player: players.find(p => p.id === playerId),
      count
    }))
    .filter(item => item.player);

  if (topScorers.length === 0 && topAssisters.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${compact ? 'text-xs' : 'text-sm'}`}>
      {topScorers.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-green-700">
            <Target className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
            <span className="font-medium">Mål:</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {topScorers.map(({ player, count }) => player && (
              <Badge 
                key={player.id} 
                variant="outline" 
                className={`bg-green-50 border-green-200 ${compact ? 'text-xs px-1.5 py-0.5' : ''}`}
              >
                {player.name.split(' ')[0]} ({count})
              </Badge>
            ))}
          </div>
        </div>
      )}

      {topAssisters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-blue-700">
            <Users className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
            <span className="font-medium">Assist:</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {topAssisters.map(({ player, count }) => player && (
              <Badge 
                key={player.id} 
                variant="outline" 
                className={`bg-blue-50 border-blue-200 ${compact ? 'text-xs px-1.5 py-0.5' : ''}`}
              >
                {player.name.split(' ')[0]} ({count})
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
