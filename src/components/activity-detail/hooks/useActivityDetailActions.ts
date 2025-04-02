
import { useState } from "react";
import { Activity, Player } from "@/types/player";
import { useToast } from "@/hooks/use-toast";

interface UseActivityDetailActionsProps {
  activity: Activity;
  players: Player[];
  onActivityUpdate?: (updatedActivity: Activity) => void;
  onKioskAssignmentUpdate?: (activityId: string, playerId?: string) => void;
}

export function useActivityDetailActions({
  activity,
  players,
  onActivityUpdate,
  onKioskAssignmentUpdate
}: UseActivityDetailActionsProps) {
  const { toast } = useToast();
  const [currentActivity, setCurrentActivity] = useState<Activity>(activity);
  const [isAddingPlayers, setIsAddingPlayers] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clearParticipantsDialogOpen, setClearParticipantsDialogOpen] = useState(false);

  const isHistorical = new Date(activity.date) < new Date(new Date().setHours(0, 0, 0, 0));
  
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
        onKioskAssignmentUpdate(currentActivity.id, undefined);
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
        onKioskAssignmentUpdate(currentActivity.id, undefined);
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
