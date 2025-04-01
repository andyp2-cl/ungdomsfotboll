
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalStatsSummary } from "./GoalStatsSummary";
import { PlayerGoalsTable } from "./PlayerGoalsTable";

interface PlayerGoalStats {
  playerId: string;
  name: string;
  goals: number;
  assists: number;
  matches: number;
}

interface DetailedGoalStatsProps {
  playerStats: PlayerGoalStats[];
  totalStats: {
    goals: number;
    assists: number;
  };
}

export function DetailedGoalStats({ playerStats, totalStats }: DetailedGoalStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detaljerad målstatistik</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <GoalStatsSummary 
            totalStats={totalStats}
            playerCount={playerStats.length}
          />
          
          <PlayerGoalsTable playerStats={playerStats} />
        </div>
      </CardContent>
    </Card>
  );
}
