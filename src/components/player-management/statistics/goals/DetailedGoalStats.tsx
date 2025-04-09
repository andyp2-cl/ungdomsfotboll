
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalStatsSummary } from "./GoalStatsSummary";
import { PlayerGoalsTable } from "./PlayerGoalsTable";
import { PlayerGoalStat } from "./calculateGoalStats";

interface DetailedGoalStatsProps {
  playerStats: PlayerGoalStat[];
  totalStats: {
    goals: number;
    assists: number;
  };
  onPlayerSelect?: (playerId: string) => void;
  className?: string;
}

export function DetailedGoalStats({ 
  playerStats, 
  totalStats, 
  onPlayerSelect,
  className = ""
}: DetailedGoalStatsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Detaljerad målstatistik</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <GoalStatsSummary 
            totalStats={totalStats}
            playerCount={playerStats.length}
          />
          
          <PlayerGoalsTable 
            playerStats={playerStats} 
            onPlayerSelect={onPlayerSelect}
          />
        </div>
      </CardContent>
    </Card>
  );
}
