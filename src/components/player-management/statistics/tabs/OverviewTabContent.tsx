
import React from "react";
import { Activity, Player } from "@/types/player";
import { TeamStatistics } from "@/components/TeamStatistics";

interface OverviewTabContentProps {
  players: Player[];
  activities: Activity[];
}

export function OverviewTabContent({ players, activities }: OverviewTabContentProps) {
  return <TeamStatistics players={players} activities={activities} />;
}
