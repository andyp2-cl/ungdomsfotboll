
import React from "react";
import { Player, Activity } from "@/types/player";
import { PlayerSummaryCard } from "@/components/charts/PlayerSummaryCard";
import { PlayerAttendanceAnalytics } from "@/components/charts/PlayerAttendanceAnalytics";
import { PlayerPerformanceChart } from "@/components/performance-charts";
import { MonthlyActivityChart } from "@/components/MonthlyActivityChart";

interface AnalyticsTabContentProps {
  players: Player[];
  activities: Activity[];
  gradeData: { grade: string; players: number }[];
}

export function AnalyticsTabContent({ 
  players, 
  activities,
  gradeData
}: AnalyticsTabContentProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <PlayerSummaryCard data={gradeData} />
      
      <div className="col-span-1 md:col-span-2">
        <PlayerAttendanceAnalytics 
          players={players}
          activities={activities}
        />
      </div>
      
      <div className="col-span-1 md:col-span-3">
        <PlayerPerformanceChart
          players={players}
          activities={activities}
        />
      </div>
      
      <div className="col-span-1 md:col-span-3">
        <MonthlyActivityChart activities={activities} />
      </div>
    </div>
  );
}
