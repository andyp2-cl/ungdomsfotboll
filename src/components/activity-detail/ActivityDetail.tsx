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
  onUpdate?: (activity: Activity) => void;
  onKioskUpdate?: (activityId: string, playerId?: string) => Promise<boolean>;
  onDelete?: (activityId: string) => Promise<boolean>;
  relatedActivities?: Activity[];
  onMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
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
  onPlayerSelect,
  onMatchResultUpdate
}: ActivityDetailProps) {
  const [currentActivity, setCurrentActivity] = useState<Activity>(activity);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    setCurrentActivity(activity);
  }, [activity]);

  const isHistorical = new Date(activity.date) < new Date(new Date().setHours(0, 0, 0, 0));
  
  const participatingPlayers = players.filter(
    (player) => currentActivity.participants?.includes(player.id)
  );

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

  const handleActivityUpdate = (updatedActivity: Activity) => {
    const normalizedActivity = normalizePlayerStats(updatedActivity);
    setCurrentActivity(normalizedActivity);
    
    if (onActivityUpdate) {
      onActivityUpdate(normalizedActivity);
    }
    
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

  const handleClose = onBack || onClose;

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
        {normalizedCurrentActivity.type === "match" && (
          <ActivityResultSection 
            activity={normalizedCurrentActivity}
            isHistorical={isHistorical}
            updateActivity={handleActivityUpdate}
            onMatchResultUpdate={onMatchResultUpdate}
          />
        )}
        
        {normalizedCurrentActivity.type === "match" && (
          <ActivityStatsSection 
            activity={normalizedCurrentActivity}
            players={players}
            participatingPlayers={participatingPlayers}
            updateActivity={handleActivityUpdate}
            isHistorical={isHistorical}
          />
        )}
        
        <ActivityParticipantSection 
          activity={normalizedCurrentActivity}
          players={players}
          updateActivity={handleActivityUpdate}
          onPlayerSelect={onPlayerSelect}
        />
        
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

      <DeleteActivityDialog
        activityName={normalizedCurrentActivity.name}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDeleteActivity}
      />
    </Card>
  );
}
