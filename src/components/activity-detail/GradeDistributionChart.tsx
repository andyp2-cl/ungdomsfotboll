
import React from "react";
import { Activity, Player } from "@/types/player";
import { GradePieChart } from "./match-result/GradePieChart";

interface GradeDistributionChartProps {
  activity: Activity;
  participatingPlayers: Player[];
}

export function GradeDistributionChart({ activity, participatingPlayers }: GradeDistributionChartProps) {
  if (!participatingPlayers || participatingPlayers.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-4 border-t pt-4">
      <GradePieChart 
        activity={activity} 
        participatingPlayers={participatingPlayers} 
      />
    </div>
  );
}
