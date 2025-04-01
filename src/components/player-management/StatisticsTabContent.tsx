
import React from "react";
import { Player, Activity } from "@/types/player";
import { TeamStatistics } from "@/components/TeamStatistics";
import { PlayerSummaryCard } from "@/components/charts/PlayerSummaryCard";
import { PlayerAttendanceAnalytics } from "@/components/charts/PlayerAttendanceAnalytics";
import { PlayerPerformanceChart } from "@/components/PlayerPerformanceChart";
import { MonthlyActivityChart } from "@/components/MonthlyActivityChart";

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
  return (
    <div className="space-y-6">
      <TeamStatistics players={players} activities={activities} />
    </div>
  );
}
