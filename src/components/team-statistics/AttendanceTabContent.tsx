
import React from 'react';
import { Player, Activity } from "@/types/player";
import { PlayerPerformanceChart } from "@/components/PlayerPerformanceChart";
import { PlayerAttendanceAnalytics } from "@/components/charts/PlayerAttendanceAnalytics";

interface AttendanceTabContentProps {
  players: Player[];
  activities: Activity[];
}

export function AttendanceTabContent({ players, activities }: AttendanceTabContentProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <PlayerPerformanceChart players={players} activities={activities} />
      <PlayerAttendanceAnalytics players={players} activities={activities} />
    </div>
  );
}
