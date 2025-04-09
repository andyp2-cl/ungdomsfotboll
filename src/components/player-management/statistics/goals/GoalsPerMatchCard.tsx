
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalsPerMatchChart } from "./GoalsPerMatchChart";
import { PlayerGoalStat } from "./calculateGoalStats";

interface GoalsPerMatchCardProps {
  playerStats: PlayerGoalStat[];
  className?: string;
}

export function GoalsPerMatchCard({ playerStats, className }: GoalsPerMatchCardProps) {
  const topScorers = playerStats.slice(0, 10);
  
  const chartData = topScorers.map(p => ({
    name: p.name,
    goalsPerMatch: p.matches > 0 ? Number((p.goals / p.matches).toFixed(2)) : 0
  }));
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Mål per match</CardTitle>
      </CardHeader>
      <CardContent>
        <GoalsPerMatchChart data={chartData} />
      </CardContent>
    </Card>
  );
}
