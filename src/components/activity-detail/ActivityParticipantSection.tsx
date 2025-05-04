
import React, { useState } from "react";
import { Activity, Player } from "@/types/player";
import { useToast } from "@/hooks/use-toast";
import { AddPlayersToActivity } from "@/components/AddPlayersToActivity";
import { ParticipantList } from "./ParticipantList";
import { ParticipantActions } from "./ParticipantActions";

interface ActivityParticipantSectionProps {
  activity: Activity;
  players: Player[];
  updateActivity: (updatedActivity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
}

export function ActivityParticipantSection({
  activity,
  players,
  updateActivity,
  onPlayerSelect
}: ActivityParticipantSectionProps) {
  const { toast } = useToast();
  const [isAddingPlayers, setIsAddingPlayers] = useState(false);
  
  // Get participating players and sort them by grade (A, B, C, D)
  const participatingPlayers = players
    .filter(player => activity.participants?.includes(player.id))
    .sort((a, b) => {
      // Sort by grade - prioritize A, then B, then C, then D
      const getGradeValue = (grade?: string) => {
        if (!grade) return 5; // No grade goes last
        switch(grade) {
          case 'A': return 1;
          case 'B': return 2;
          case 'C': return 3;
          case 'D': return 4;
          default: return 5;
        }
      };
      
      return getGradeValue(a.grade) - getGradeValue(b.grade);
    });

  const handleAddPlayers = (playerIds: string[]) => {
    const updatedParticipants = [
      ...(activity.participants || []),
      ...playerIds
    ];
    
    const updatedActivity = {
      ...activity,
      participants: updatedParticipants
    };
    
    updateActivity(updatedActivity);
    
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
    
    const updatedParticipants = (activity.participants || []).filter(
      id => id !== playerId
    );
    
    const updatedActivity = {
      ...activity,
      participants: updatedParticipants
    };
    
    if (activity.kioskAssignedPlayerId === playerId) {
      updatedActivity.kioskAssignedPlayerId = undefined;
    }
    
    updateActivity(updatedActivity);
    
    toast({
      title: "Spelare borttagen",
      description: `${player.name} har tagits bort från aktiviteten.`,
    });
  };

  const handleClearAllParticipants = () => {
    const updatedActivity = {
      ...activity,
      participants: [],
      kioskAssignedPlayerId: undefined
    };
    
    updateActivity(updatedActivity);
    
    toast({
      title: "Deltagarlista rensad",
      description: `Alla spelare har tagits bort från aktiviteten.`,
    });
  };

  return (
    <div className="border rounded-md p-4">
      <h3 className="text-lg font-semibold mb-3">Deltagare ({participatingPlayers.length})</h3>
      
      <ParticipantList 
        participants={participatingPlayers}
        onPlayerSelect={onPlayerSelect}
        onRemovePlayer={handleRemovePlayer}
      />

      <ParticipantActions 
        activity={activity}
        nonParticipantPlayers={players.filter(p => !activity.participants?.includes(p.id))}
        onAddPlayers={handleAddPlayers}
        participantCount={participatingPlayers.length}
        isAddingPlayers={isAddingPlayers}
        setIsAddingPlayers={setIsAddingPlayers}
        onClearAllParticipants={handleClearAllParticipants}
      />

      {isAddingPlayers && (
        <AddPlayersToActivity 
          activity={activity}
          players={players}
          onAddPlayers={handleAddPlayers}
          currentParticipantIds={activity.participants || []}
        />
      )}
    </div>
  );
}
