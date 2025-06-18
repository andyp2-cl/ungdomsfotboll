import React, { useState } from "react";
import { Activity, Player } from "@/types/player";
import { useToast } from "@/hooks/use-toast";
import { AddPlayersToActivity } from "@/components/AddPlayersToActivity";
import { ParticipantList } from "./ParticipantList";
import { ParticipantActions } from "./ParticipantActions";
import { sortPlayersByGrade } from "@/utils/gradeUtils";
import { supabase } from "@/lib/supabase";

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
  const participatingPlayers = sortPlayersByGrade(
    players.filter(player => activity.participants?.includes(player.id))
  );

  const handleAddPlayers = async (playerIds: string[]) => {
    try {
      // First add players to player_activities table
      const insertPromises = playerIds.map(playerId => 
        supabase
          .from('player_activities')
          .insert({
            id: crypto.randomUUID(),
            player_id: playerId,
            activity_id: activity.id
          })
      );

      await Promise.all(insertPromises);

      // Update participants array in activity
      const updatedParticipants = [
        ...(activity.participants || []),
        ...playerIds
      ];
      
      const updatedActivity = {
        ...activity,
        participants: updatedParticipants
      };
      
      // Update activity in database
      await updateActivity(updatedActivity);
      
      const playerNames = playerIds.map(id => 
        players.find(p => p.id === id)?.name || "Spelare"
      ).join(", ");
      
      toast({
        title: "Spelare tillagda",
        description: `${playerNames} har lagts till i aktiviteten.`,
      });
    } catch (error) {
      console.error("Error adding players:", error);
      toast({
        title: "Ett fel uppstod",
        description: "Kunde inte lägga till spelarna. Försök igen.",
        variant: "destructive"
      });
    }
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
