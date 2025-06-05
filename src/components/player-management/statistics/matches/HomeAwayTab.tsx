
import React from "react";
import { HomeAwayStats } from "./HomeAwayStats";

interface StatsData {
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goals: number;
  conceded: number;
}

interface HomeAwayTabProps {
  homeStats: StatsData;
  awayStats: StatsData;
}

export function HomeAwayTab({ homeStats, awayStats }: HomeAwayTabProps) {
  return (
    <div className="space-y-6">
      <HomeAwayStats homeStats={homeStats} awayStats={awayStats} />
    </div>
  );
}
