import React from "react";
import { Activity, Player } from "@/types/player";
import { ActivityDetailContent } from "./ActivityDetailContent";
import { ActivityDetailHeader } from "./ActivityDetailHeader";
import { useState } from "react";
import { DeleteActivityDialog } from "./DeleteActivityDialog";
import { useToast } from "@/hooks/use-toast";

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Wrapper to handle activity updates
  const handleActivityUpdate = async (updatedActivity: Activity) => {
    try {
      console.log("ActivityDetailView handleActivityUpdate called with:", updatedActivity);
      await onActivityUpdate(updatedActivity);
      console.log("onActivityUpdate completed");
      toast({
        title: "Aktivitet uppdaterad",
        description: "Ändringarna har sparats.",
      });
    } catch (error) {
      console.error("Error updating activity:", error);
      toast({
        title: "Kunde inte uppdatera aktiviteten",
        description: "Ett fel uppstod när aktiviteten skulle uppdateras.",
        variant: "destructive"
      });
      throw error; // Re-throw error to propagate it
    }
  };

  // Calculate if activity is historical
  const isHistorical = (() => {
    const activityDate = new Date(activity.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return activityDate < today;
  })();

  // Generate unique ID for sharing
  const targetElementId = `activity-detail-${activity.id}`;

  return (
    <div id={targetElementId} className="space-y-6">
      <ActivityDetailHeader 
        activity={activity}
        isHistorical={isHistorical}
        onClose={onClose}
        onEdit={onEdit}
        onDeleteOpen={() => setIsDeleteDialogOpen(true)}
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

      <DeleteActivityDialog
        activity={activity}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={async () => {
          const success = await onDeleteActivity(activity.id);
          if (success) {
            onClose();
          }
          setIsDeleteDialogOpen(false);
        }}
      />
    </div>
  );
}
