
import React from "react";
import { Player, Activity } from "@/types/player";
import { PlayerMatchTabs } from "./PlayerMatchTabs";

interface PlayerMatchHistoryProps {
  player: Player;
  activities: Activity[];
  onActivitySelect?: (activity: Activity) => void;
  allPlayers?: Player[]; // Add allPlayers prop
}

export function PlayerMatchHistory({ 
  player, 
  activities, 
  onActivitySelect,
  allPlayers 
}: PlayerMatchHistoryProps) {
  // Filter activities that this player has participated in
  const playerActivities = activities.filter(activity => 
    activity.participants?.includes(player.id)
  );
  
  // Further filter by activity type
  const playerMatches = playerActivities.filter(activity => 
    activity.type === "match"
  );
  
  const playerCups = playerActivities.filter(activity => 
    activity.type === "cup"
  );

  const handleActivitySelect = (activity: Activity) => {
    if (onActivitySelect) {
      onActivitySelect(activity);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4">Matchhistorik</h3>
      
      <PlayerMatchTabs 
        player={player}
        matches={playerMatches}
        cups={playerCups}
        activities={playerActivities}
        onActivitySelect={handleActivitySelect}
        allPlayers={allPlayers} // Pass allPlayers prop
      />
    </div>
  );
}
