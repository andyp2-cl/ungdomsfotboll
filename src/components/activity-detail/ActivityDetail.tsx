
import React, { useState } from "react";
import { Activity, Player } from "@/types/player";
import { 
  Card, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityDetailHeader } from "./ActivityDetailHeader";
import { ActivityResultSection } from "./match-result";
import { ActivityStatsSection } from "./ActivityStatsSection";
import { ActivityParticipantSection } from "./ActivityParticipantSection";
import { ActivityKioskSection } from "./ActivityKioskSection";
import { ActivityMatchesSection } from "./ActivityMatchesSection";
import { DeleteActivityDialog } from "./DeleteActivityDialog";

interface ActivityDetailProps {
  activity: Activity;
  players: Player[];
  onClose: () => void;
  onBack?: () => void;
  onEdit?: (activity: Activity) => void;
  onActivityUpdate?: (updatedActivity: Activity) => void;
  onKioskAssignmentUpdate?: (activityId: string, playerId?: string) => void;
  onActivitySelect?: (activity: Activity | null) => void;
  onDeleteActivity?: (activityId: string) => void;
  allActivities?: Activity[];
  cupMatches?: Activity[];
  onPlayerSelect?: (playerId: string) => void;
  // Add these props to match with ActivityManagement.tsx usage
  onUpdate?: (activity: Activity) => void;
  onKioskUpdate?: (activityId: string, playerId?: string) => Promise<boolean>;
  onDelete?: (activityId: string) => Promise<boolean>;
  relatedActivities?: Activity[];
}

export function ActivityDetail({ 
  activity, 
  players, 
  onClose, 
  onBack, 
  onEdit, 
  onActivityUpdate,
  onUpdate,
  onKioskAssignmentUpdate,
  onKioskUpdate,
  onActivitySelect,
  onDeleteActivity,
  onDelete,
  allActivities,
  relatedActivities,
  cupMatches = [],
  onPlayerSelect
}: ActivityDetailProps) {
  const [currentActivity, setCurrentActivity] = useState<Activity>(activity);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Determine if this is a historical activity (past date)
  const isHistorical = new Date(activity.date) < new Date(new Date().setHours(0, 0, 0, 0));
  
  const participatingPlayers = players.filter(
    (player) => currentActivity.participants?.includes(player.id)
  );

  // Update activity handler
  const handleActivityUpdate = (updatedActivity: Activity) => {
    setCurrentActivity(updatedActivity);
    
    if (onActivityUpdate) {
      onActivityUpdate(updatedActivity);
    }
    
    // Also call onUpdate if provided
    if (onUpdate) {
      onUpdate(updatedActivity);
    }
  };

  const handleDeleteActivity = () => {
    if (onDeleteActivity) {
      onDeleteActivity(currentActivity.id);
      onClose();
    } else if (onDelete) {
      onDelete(currentActivity.id).then(success => {
        if (success) {
          if (onBack) onBack();
          else onClose();
        }
      });
    }
  };

  // Choose the appropriate close handler
  const handleClose = onBack || onClose;

  return (
    <Card className="w-full lg:max-w-3xl mx-auto">
      <ActivityDetailHeader 
        activity={currentActivity}
        isHistorical={isHistorical}
        onClose={handleClose}
        onEdit={onEdit}
        onDeleteOpen={() => setIsDeleteDialogOpen(true)}
      />

      <CardContent className="space-y-6">
        {/* Match Result (only for matches) */}
        {currentActivity.type === "match" && (
          <ActivityResultSection 
            activity={currentActivity}
            isHistorical={isHistorical}
            updateActivity={handleActivityUpdate}
          />
        )}
        
        {/* Match Statistics (only for matches) */}
        {currentActivity.type === "match" && (
          <ActivityStatsSection 
            activity={currentActivity}
            players={players}
            participatingPlayers={participatingPlayers}
            updateActivity={handleActivityUpdate}
            isHistorical={isHistorical}
          />
        )}
        
        {/* Participants section */}
        <ActivityParticipantSection 
          activity={currentActivity}
          players={players}
          updateActivity={handleActivityUpdate}
          onPlayerSelect={onPlayerSelect}
        />
        
        {/* Kiosk assignment (only for matches) */}
        {currentActivity.type === "match" && (
          <ActivityKioskSection 
            activity={currentActivity}
            players={players}
            updateActivity={handleActivityUpdate}
            onKioskAssignmentUpdate={onKioskAssignmentUpdate || 
              (onKioskUpdate ? 
                (activityId, playerId) => {
                  onKioskUpdate(activityId, playerId);
                  return Promise.resolve(true);
                } : undefined)}
          />
        )}
        
        {/* Cup matches (only for cups) */}
        {currentActivity.type === "cup" && cupMatches && cupMatches.length > 0 && (
          <ActivityMatchesSection 
            cupMatches={cupMatches}
            onActivitySelect={onActivitySelect}
          />
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button variant="outline" onClick={handleClose}>Stäng</Button>
      </CardFooter>

      {/* Delete confirmation dialog */}
      <DeleteActivityDialog
        activityName={currentActivity.name}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDeleteActivity}
      />
    </Card>
  );
}
