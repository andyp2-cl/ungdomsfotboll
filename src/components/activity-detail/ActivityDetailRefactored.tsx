
import React, { useState } from "react";
import { Activity, Player } from "@/types/player";
import { 
  Card, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityDetailHeader } from "./ActivityDetailHeader";
import { ActivityResultSection } from "./ActivityResultSection";
import { ActivityStatsSection } from "./ActivityStatsSection";
import { ActivityParticipantSection } from "./ActivityParticipantSection";
import { ActivityKioskSection } from "./ActivityKioskSection";
import { ActivityMatchesSection } from "./ActivityMatchesSection";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ActivityDetailProps {
  activity: Activity;
  players: Player[];
  onClose: () => void;
  onEdit?: (activity: Activity) => void;
  onActivityUpdate?: (updatedActivity: Activity) => void;
  onKioskAssignmentUpdate?: (activityId: string, playerId?: string) => void;
  onActivitySelect?: (activity: Activity | null) => void;
  onDeleteActivity?: (activityId: string) => void;
  allActivities?: Activity[];
  cupMatches?: Activity[];
  onPlayerSelect?: (playerId: string) => void;
}

export function ActivityDetail({ 
  activity, 
  players, 
  onClose, 
  onEdit, 
  onActivityUpdate,
  onKioskAssignmentUpdate,
  onActivitySelect,
  onDeleteActivity,
  allActivities,
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
  };

  const handleDeleteActivity = () => {
    if (onDeleteActivity) {
      onDeleteActivity(currentActivity.id);
      onClose();
    }
  };

  return (
    <Card className="w-full lg:max-w-3xl mx-auto">
      <ActivityDetailHeader 
        activity={currentActivity}
        isHistorical={isHistorical}
        onClose={onClose}
        onEdit={onEdit}
        onDeleteOpen={() => setIsDeleteDialogOpen(true)}
      />

      <CardContent className="space-y-6">
        {/* Match Result (only for matches) */}
        {currentActivity.type === "match" && isHistorical && (
          <ActivityResultSection 
            activity={currentActivity}
            isHistorical={isHistorical}
            updateActivity={handleActivityUpdate}
          />
        )}
        
        {/* Match Statistics (only for matches) */}
        {currentActivity.type === "match" && isHistorical && (
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
            onKioskAssignmentUpdate={onKioskAssignmentUpdate}
          />
        )}
        
        {/* Cup matches (only for cups) */}
        {currentActivity.type === "cup" && cupMatches.length > 0 && (
          <ActivityMatchesSection 
            cupMatches={cupMatches}
            onActivitySelect={(match) => onActivitySelect && onActivitySelect(match)}
          />
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button variant="outline" onClick={onClose}>Stäng</Button>
      </CardFooter>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Radera aktivitet</AlertDialogTitle>
            <AlertDialogDescription>
              Är du säker på att du vill radera "{currentActivity.name}"? 
              Denna åtgärd kan inte ångras och all information kopplad till aktiviteten kommer att försvinna.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteActivity} 
              className="bg-red-500 hover:bg-red-700"
            >
              Radera
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
