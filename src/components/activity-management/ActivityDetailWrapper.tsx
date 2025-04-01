
import React from "react";
import { Activity, Player } from "@/types/player";
import { ActivityDetail } from "@/components/activity-detail";

interface ActivityDetailWrapperProps {
  selectedActivity: Activity;
  players: Player[];
  activities: Activity[];
  cupMatches: Activity[];
  onActivitySelect: (activity: Activity | null) => void;
  onEditActivityClick: (activity: Activity) => void;
  onActivityUpdate: (activity: Activity) => void;
  handleKioskUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  handleDeleteActivity: (activityId: string) => Promise<boolean>;
}

export function ActivityDetailWrapper({
  selectedActivity,
  players,
  activities,
  cupMatches,
  onActivitySelect,
  onEditActivityClick,
  onActivityUpdate,
  handleKioskUpdate,
  handleDeleteActivity
}: ActivityDetailWrapperProps) {
  return (
    <ActivityDetail
      activity={selectedActivity}
      players={players}
      onBack={() => onActivitySelect(null)}
      onEdit={onEditActivityClick}
      onUpdate={onActivityUpdate}
      onKioskUpdate={handleKioskUpdate}
      onActivitySelect={onActivitySelect}
      onDelete={handleDeleteActivity}
      relatedActivities={activities}
      cupMatches={cupMatches}
      onClose={() => onActivitySelect(null)}
    />
  );
}
