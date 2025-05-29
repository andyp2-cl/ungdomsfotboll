
import { Activity, Player } from "@/types/player";
import { ActivityDetailView } from "./ActivityDetailView";

interface ActivityDetailProps {
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

export function ActivityDetail({ 
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
}: ActivityDetailProps) {
  return (
    <ActivityDetailView
      activity={activity}
      players={players}
      onBack={onBack}
      onEdit={onEdit}
      onActivityUpdate={onActivityUpdate}
      onKioskAssignmentUpdate={onKioskAssignmentUpdate}
      onActivitySelect={onActivitySelect}
      onDeleteActivity={onDeleteActivity}
      relatedActivities={relatedActivities}
      cupMatches={cupMatches}
      allActivities={allActivities}
      onClose={onClose}
      onPlayerSelect={onPlayerSelect}
      onMatchResultUpdate={onMatchResultUpdate}
      onAddActivity={onAddActivity}
    />
  );
}
