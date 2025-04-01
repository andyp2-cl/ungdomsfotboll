
import React from "react";
import { Player, Activity } from "@/types/player";
import { StatisticsTabsWrapper } from "./statistics";

interface StatisticsTabContentProps {
  players: Player[];
  activities: Activity[];
  gradeData: { grade: string; players: number }[];
}

export function StatisticsTabContent({ 
  players, 
  activities,
  gradeData
}: StatisticsTabContentProps) {
  return <StatisticsTabsWrapper players={players} activities={activities} gradeData={gradeData} />;
}
