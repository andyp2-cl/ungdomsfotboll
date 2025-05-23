
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
  onActivityUpdate: (activity: Activity) => Promise<void>;
  handleKioskUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  handleDeleteActivity: (activityId: string) => Promise<boolean>;
  handleMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
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
  handleDeleteActivity,
  handleMatchResultUpdate
}: ActivityDetailWrapperProps) {
  
  const relatedActivities = selectedActivity?.cupId 
    ? activities.filter(a => a.cupId === selectedActivity.cupId && a.id !== selectedActivity.id)
    : [];
  
  console.log("ActivityDetailWrapper with handleMatchResultUpdate:", !!handleMatchResultUpdate);
  
  // Make sure onActivityUpdate function returns Promise<void>
  const handleActivityUpdate = async (activity: Activity): Promise<void> => {
    await onActivityUpdate(activity);
  };
  
  return (
    <ActivityDetail
      activity={selectedActivity}
      players={players}
      onClose={() => onActivitySelect(null)}
      onEdit={onEditActivityClick}
      onActivityUpdate={handleActivityUpdate}
      onKioskAssignmentUpdate={handleKioskUpdate}
      onDeleteActivity={async (id) => {
        const success = await handleDeleteActivity(id);
        if (success) {
          onActivitySelect(null);
        }
        return success;
      }}
      allActivities={activities}
      relatedActivities={relatedActivities}
      cupMatches={cupMatches}
      onActivitySelect={onActivitySelect}
      onMatchResultUpdate={handleMatchResultUpdate}
    />
  );
}
