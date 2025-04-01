
import React from "react";
import { Activity, Player } from "@/types/player";
import { TeamFormationAnalysis } from "./TeamFormationAnalysis";

interface FormationTabContentProps {
  players: Player[];
  activities: Activity[];
}

export function FormationTabContent({ players, activities }: FormationTabContentProps) {
  return (
    <div className="space-y-6">
      <TeamFormationAnalysis players={players} />
    </div>
  );
}
