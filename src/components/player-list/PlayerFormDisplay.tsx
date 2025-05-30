
import React from "react";
import { Player, Activity } from "@/types/player";
import { Badge } from "@/components/ui/badge";
import { isTrainer } from "@/utils/positionUtils";

interface PlayerFormDisplayProps {
  player: Player;
  activities: Activity[];
}

export function PlayerFormDisplay({ player, activities }: PlayerFormDisplayProps) {
  const isCoach = isTrainer(player.positions);
  
  if (isCoach) {
    return <span className="text-muted-foreground">-</span>;
  }

  // Get player's historical matches with results only
  const today = new Date();
  const playerMatches = activities
    .filter(activity => {
      // Only include matches where this player participated
      if (activity.type !== "match" || !activity.participants?.includes(player.id)) {
        return false;
      }
      
      // Only include historical matches (before today)
      const matchDate = new Date(activity.date);
      if (matchDate >= today) {
        return false;
      }
      
      // Only include matches with results
      return activity.isWin !== undefined || 
             (activity.homeScore !== undefined && activity.awayScore !== undefined) ||
             (activity.result && activity.result.includes('-'));
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4); // Take last 4 historical matches with results

  if (playerMatches.length === 0) {
    return <span className="text-muted-foreground text-sm">Inga matcher</span>;
  }

  // Determine match result for each match
  const getMatchResult = (match: Activity): 'W' | 'D' | 'L' => {
    if (match.isWin === true) return 'W';
    if (match.isWin === false) {
      // Check if it's a draw by comparing scores
      if (match.homeScore !== undefined && match.awayScore !== undefined) {
        return match.homeScore === match.awayScore ? 'D' : 'L';
      }
      return 'L';
    }
    
    // Fallback: check scores if isWin is not set
    if (match.homeScore !== undefined && match.awayScore !== undefined) {
      if (match.homeScore > match.awayScore) return 'W';
      if (match.homeScore === match.awayScore) return 'D';
      return 'L';
    }
    
    return 'L'; // Default to loss if no clear result
  };

  const results = playerMatches.map(getMatchResult);

  // Pad with empty spaces if less than 4 matches
  while (results.length < 4) {
    results.unshift(''); // Add empty strings at the beginning to show older positions as empty
  }

  const getResultColor = (result: string) => {
    switch (result) {
      case 'W': return 'text-green-600 bg-green-100';
      case 'D': return 'text-gray-900 bg-gray-100';
      case 'L': return 'text-red-600 bg-red-100';
      default: return 'text-gray-400 bg-gray-50'; // Handle empty strings and any other cases
    }
  };

  return (
    <div className="flex gap-1">
      {results.map((result, index) => (
        <div
          key={index}
          className={`w-6 h-6 rounded text-xs font-medium flex items-center justify-center ${getResultColor(result)}`}
        >
          {result || '-'}
        </div>
      ))}
    </div>
  );
}
