
import React from "react";
import { Activity, Player } from "@/types/player";
import { GradeParticipationChart } from "./participation/GradeParticipationChart";
import { ParticipationDistributionChart } from "./participation/ParticipationDistributionChart";
import { PlayerParticipationTable } from "./participation/PlayerParticipationTable";

interface ParticipationTabContentProps {
  activities: Activity[];
  players: Player[];
}

export function ParticipationTabContent({ activities, players }: ParticipationTabContentProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <GradeParticipationChart players={players} activities={activities} />
      <ParticipationDistributionChart players={players} activities={activities} />
      <PlayerParticipationTable players={players} activities={activities} />
    </div>
  );
}
