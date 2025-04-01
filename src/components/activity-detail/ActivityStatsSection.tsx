
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
  return (
    <ActivityMatchStats
      activity={activity}
      players={players}
      participatingPlayers={participatingPlayers}
      updateActivity={updateActivity}
      isHistorical={isHistorical}
    />
  );
}
