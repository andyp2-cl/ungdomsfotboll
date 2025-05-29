
import React from "react";
import { Activity, Player } from "@/types/player";
import { ActivityDetailContent } from "./ActivityDetailContent";
import { ActivityHeader } from "./ActivityHeader";

interface ActivityDetailViewProps {
  activity: Activity;
  players: Player[];
  onBack: () => void;
  onEdit: (activity: Activity) => void;
  onDeleteActivity: (activityId: string) => Promise<boolean>;
  onActivityUpdate: (activity: Activity) => Promise<void>;
  onKioskAssignmentUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  onActivitySelect?: (activity: Activity) => void;
  relatedActivities?: Activity[];
  cupMatches?: Activity[];
  allActivities?: Activity[];
  onClose: () => void;
  onPlayerSelect?: (playerId: string) => void;
  onMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
  onAddActivity?: (newActivity: Activity) => Promise<void>;
}

export function ActivityDetailView({
  activity,
  players,
  onBack,
  onEdit,
  onDeleteActivity,
  onActivityUpdate,
  onKioskAssignmentUpdate,
  onActivitySelect,
  relatedActivities = [],
  cupMatches = [],
  allActivities = [],
  onClose,
  onPlayerSelect,
  onMatchResultUpdate,
  onAddActivity
}: ActivityDetailViewProps) {
  
  // Wrapper to handle activity updates
  const handleActivityUpdate = (updatedActivity: Activity) => {
    onActivityUpdate(updatedActivity);
  };

  return (
    <div className="space-y-6">
      <ActivityHeader 
        activity={activity}
        onBack={onBack}
        onEdit={onEdit}
        onDeleteActivity={onDeleteActivity}
      />
      
      <ActivityDetailContent 
        activity={activity}
        players={players}
        onActivityUpdate={handleActivityUpdate}
        onPlayerSelect={onPlayerSelect}
        onKioskAssignmentUpdate={onKioskAssignmentUpdate}
        onActivitySelect={onActivitySelect}
        relatedActivities={relatedActivities}
        cupMatches={cupMatches}
        allActivities={allActivities}
        onMatchResultUpdate={onMatchResultUpdate}
        onAddActivity={onAddActivity}
      />
    </div>
  );
}
