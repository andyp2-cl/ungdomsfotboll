
import React, { useMemo } from "react";
import { Activity, Player } from "@/types/player";
import { TopScorersChart } from "./TopScorersChart";
import { DetailedGoalStats } from "./DetailedGoalStats";
import { GoalsPerMatchCard } from "./GoalsPerMatchCard";
import { calculateGoalStats } from "./calculateGoalStats";

interface GoalsTabContentProps {
  activities: Activity[];
  players: Player[];
  onPlayerSelect?: (player: Player) => void;
}

export function GoalsTabContent({ activities, players, onPlayerSelect }: GoalsTabContentProps) {
  // Calculate goal statistics 
  const { playerStats, totalStats } = useMemo(() => 
    calculateGoalStats(activities, players), 
    [activities, players]
  );

  // Handle player selection by ID
  const handlePlayerSelect = (playerId: string) => {
    if (onPlayerSelect) {
      const player = players.find(p => p.id === playerId);
      if (player) {
        onPlayerSelect(player);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <TopScorersChart playerStats={playerStats} />
      
      <DetailedGoalStats 
        playerStats={playerStats}
        totalStats={totalStats}
        onPlayerSelect={handlePlayerSelect}
      />
      
      <GoalsPerMatchCard playerStats={playerStats} />
    </div>
  );
}
