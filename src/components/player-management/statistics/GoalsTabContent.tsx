
import React, { useMemo } from "react";
import { Activity, Player } from "@/types/player";
import { TopScorersChart } from "./goals/TopScorersChart";
import { DetailedGoalStats } from "./goals/DetailedGoalStats";
import { GoalsPerMatchCard } from "./goals/GoalsPerMatchCard";
import { calculateGoalStats } from "./goals/calculateGoalStats";

interface GoalsTabContentProps {
  activities: Activity[];
  players: Player[];
}

export function GoalsTabContent({ activities, players }: GoalsTabContentProps) {
  // Calculate goal statistics 
  const { playerStats, totalStats } = useMemo(() => 
    calculateGoalStats(activities, players), 
    [activities, players]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <TopScorersChart playerStats={playerStats} />
      
      <DetailedGoalStats 
        playerStats={playerStats}
        totalStats={totalStats}
      />
      
      <GoalsPerMatchCard playerStats={playerStats} />
    </div>
  );
}
