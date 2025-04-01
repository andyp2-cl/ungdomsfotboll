
import React, { useState, useEffect } from "react";
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

  // Update currentActivity when activity prop changes
  useEffect(() => {
    setCurrentActivity(activity);
  }, [activity]);

  // Determine if this is a historical activity (past date)
  const isHistorical = new Date(activity.date) < new Date(new Date().setHours(0, 0, 0, 0));
  
  const participatingPlayers = players.filter(
    (player) => currentActivity.participants?.includes(player.id)
  );

  // Helper function to safely normalize player_stats
  const normalizePlayerStats = (activity: Activity): Activity => {
    if (!activity.player_stats) {
      return {
        ...activity,
        player_stats: { goals: {}, assists: {} }
      };
    }
    
    if (typeof activity.player_stats === 'string') {
      try {
        const parsed = JSON.parse(activity.player_stats);
        return {
          ...activity,
          player_stats: typeof parsed === 'string' 
            ? JSON.parse(parsed) 
            : parsed
        };
      } catch (e) {
        console.error("Error parsing player_stats:", e);
        return {
          ...activity,
          player_stats: { goals: {}, assists: {} }
        };
      }
    }
    
    return activity;
  };

  // Update activity handler
  const handleActivityUpdate = (updatedActivity: Activity) => {
    const normalizedActivity = normalizePlayerStats(updatedActivity);
    setCurrentActivity(normalizedActivity);
    
    if (onActivityUpdate) {
      onActivityUpdate(normalizedActivity);
    }
    
    // Also call onUpdate if provided
    if (onUpdate) {
      onUpdate(normalizedActivity);
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

  // Normalize current activity before rendering
  const normalizedCurrentActivity = normalizePlayerStats(currentActivity);

  return (
    <Card className="w-full lg:max-w-3xl mx-auto">
      <ActivityDetailHeader 
        activity={normalizedCurrentActivity}
        isHistorical={isHistorical}
        onClose={handleClose}
        onEdit={onEdit}
        onDeleteOpen={() => setIsDeleteDialogOpen(true)}
      />

      <CardContent className="space-y-6">
        {/* Match Result (only for matches) */}
        {normalizedCurrentActivity.type === "match" && (
          <ActivityResultSection 
            activity={normalizedCurrentActivity}
            isHistorical={isHistorical}
            updateActivity={handleActivityUpdate}
          />
        )}
        
        {/* Match Statistics (only for matches) */}
        {normalizedCurrentActivity.type === "match" && (
          <ActivityStatsSection 
            activity={normalizedCurrentActivity}
            players={players}
            participatingPlayers={participatingPlayers}
            updateActivity={handleActivityUpdate}
            isHistorical={isHistorical}
          />
        )}
        
        {/* Participants section */}
        <ActivityParticipantSection 
          activity={normalizedCurrentActivity}
          players={players}
          updateActivity={handleActivityUpdate}
          onPlayerSelect={onPlayerSelect}
        />
        
        {/* Kiosk assignment (only for matches) */}
        {normalizedCurrentActivity.type === "match" && (
          <ActivityKioskSection 
            activity={normalizedCurrentActivity}
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
        {normalizedCurrentActivity.type === "cup" && cupMatches && cupMatches.length > 0 && (
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
        activityName={normalizedCurrentActivity.name}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDeleteActivity}
      />
    </Card>
  );
}
