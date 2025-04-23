
import React, { useMemo } from "react";
import { Activity, Player } from "@/types/player";
import { DetailedGoalStats } from "./DetailedGoalStats";
import { GoalsPerMatchCard } from "./GoalsPerMatchCard";
import { calculateGoalStats } from "./calculateGoalStats";

interface GoalsTabContentProps {
  activities: Activity[];
  players: Player[];
  onPlayerSelect?: (playerId: string) => void;
}

export function GoalsTabContent({ activities, players, onPlayerSelect }: GoalsTabContentProps) {
  // Calculate goal statistics 
  const { playerStats, totalStats } = useMemo(() => 
    calculateGoalStats(activities, players), 
    [activities, players]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DetailedGoalStats 
        playerStats={playerStats}
        totalStats={totalStats}
        onPlayerSelect={onPlayerSelect}
        className="col-span-full"
      />
      
      <GoalsPerMatchCard 
        playerStats={playerStats} 
        className="col-span-full md:col-span-1" 
      />
    </div>
  );
}
