
import React from "react";
import { Activity, Player } from "@/types/player";
import { ActivityMatchStats } from "./ActivityMatchStats";

interface ActivityStatsSectionProps {
  activity: Activity;
  players: Player[];
  participatingPlayers: Player[];
  updateActivity: (updatedActivity: Activity) => void;
  isHistorical: boolean;
}

export function ActivityStatsSection({ 
  activity, 
  players,
  participatingPlayers,
  updateActivity,
  isHistorical
}: ActivityStatsSectionProps) {
  // We'll allow editing stats for all matches, including historical ones
  return (
    <ActivityMatchStats
      activity={activity}
      players={players}
      participatingPlayers={participatingPlayers}
      updateActivity={updateActivity}
      isHistorical={false} // Always enable stats editing
    />
  );
}
