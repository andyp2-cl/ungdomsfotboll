
import { useState, useMemo } from "react";
import { Activity, Player } from "@/types/player";
import { useToast } from "@/hooks/use-toast";

interface UseActivityDetailActionsProps {
  activity: Activity;
  players: Player[];
  onActivityUpdate?: (updatedActivity: Activity) => void;
  onKioskAssignmentUpdate?: (activityId: string, playerId?: string) => Promise<boolean>;
}

export function useActivityDetailActions({ 
  activity, 
  players, 
  onActivityUpdate, 
  onKioskAssignmentUpdate 
}: UseActivityDetailActionsProps) {
  const [currentActivity, setCurrentActivity] = useState<Activity>(activity);
  const [isAddingPlayers, setIsAddingPlayers] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [clearParticipantsDialogOpen, setClearParticipantsDialogOpen] = useState<boolean>(false);
  const { toast } = useToast();
  
  const isHistorical = useMemo(() => {
    const now = new Date();
    const activityDate = new Date(activity.date);
    
    if (activity.time) {
      const [hours, minutes] = activity.time.split(':').map(Number);
      activityDate.setHours(hours || 0, minutes || 0);
    } else {
      activityDate.setHours(23, 59, 59);
    }
    
    return activityDate < now;
  }, [activity]);
  
  const participatingPlayers = players.filter(
    (player) => currentActivity.participants?.includes(player.id)
  );

  const handleActivityUpdate = (updatedActivity: Activity) => {
    setCurrentActivity(updatedActivity);
    
    if (onActivityUpdate) {
      onActivityUpdate(updatedActivity);
    }
  };

  const handleAddPlayers = (playerIds: string[]) => {
    const updatedParticipants = [
      ...(currentActivity.participants || []),
      ...playerIds
    ];
    
    const updatedActivity = {
      ...currentActivity,
      participants: updatedParticipants
    };
    
    handleActivityUpdate(updatedActivity);
    
    const playerNames = playerIds.map(id => 
      players.find(p => p.id === id)?.name || "Spelare"
    ).join(", ");
    
    toast({
      title: "Spelare tillagda",
      description: `${playerNames} har lagts till i aktiviteten.`,
    });
  };

  const handleRemovePlayer = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    
    const updatedParticipants = (currentActivity.participants || []).filter(
      id => id !== playerId
    );
    
    const updatedActivity = {
      ...currentActivity,
      participants: updatedParticipants
    };
    
    if (currentActivity.kioskAssignedPlayerId === playerId) {
      updatedActivity.kioskAssignedPlayerId = undefined;
      
      if (onKioskAssignmentUpdate) {
        // Handle the Promise correctly
        onKioskAssignmentUpdate(currentActivity.id, undefined)
          .catch(error => {
            console.error("Error updating kiosk assignment:", error);
          });
      }
    }
    
    handleActivityUpdate(updatedActivity);
    
    toast({
      title: "Spelare borttagen",
      description: `${player.name} har tagits bort från aktiviteten.`,
    });
  };

  const handleClearAllParticipants = () => {
    const updatedActivity = {
      ...currentActivity,
      participants: []
    };
    
    if (currentActivity.kioskAssignedPlayerId) {
      updatedActivity.kioskAssignedPlayerId = undefined;
      
      if (onKioskAssignmentUpdate) {
        // Handle the Promise correctly
        onKioskAssignmentUpdate(currentActivity.id, undefined)
          .catch(error => {
            console.error("Error updating kiosk assignment:", error);
          });
      }
    }
    
    handleActivityUpdate(updatedActivity);
    setClearParticipantsDialogOpen(false);
    
    toast({
      title: "Deltagarlista rensad",
      description: `Alla spelare har tagits bort från aktiviteten.`,
    });
  };

  return {
    currentActivity,
    setCurrentActivity,
    isAddingPlayers,
    setIsAddingPlayers,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    clearParticipantsDialogOpen,
    setClearParticipantsDialogOpen,
    isHistorical,
    participatingPlayers,
    handleActivityUpdate,
    handleAddPlayers,
    handleRemovePlayer,
    handleClearAllParticipants
  };
}
