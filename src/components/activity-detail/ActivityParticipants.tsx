
import React from "react";
import { Activity, Player } from "@/types/player";
import { ParticipantList } from "./ParticipantList";
import { ParticipantActions } from "./ParticipantActions";
import { useIsMobile } from "@/hooks/use-mobile";

interface ActivityParticipantsProps {
  activity: Activity;
  players: Player[];
  updateActivity: (updatedActivity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
}

export function ActivityParticipants({ 
  activity, 
  players, 
  updateActivity,
  onPlayerSelect 
}: ActivityParticipantsProps) {
  const isMobile = useIsMobile();
  
  // Filter participants
  const participantPlayers = activity.participants 
    ? players.filter(player => activity.participants?.includes(player.id))
    : [];
  
  // Filter non-participants
  const nonParticipantPlayers = players.filter(
    player => !activity.participants?.includes(player.id)
  );

  // Handle adding a participant
  const handleAddParticipant = (playerId: string) => {
    const newParticipants = activity.participants 
      ? [...activity.participants, playerId]
      : [playerId];
    
    updateActivity({
      ...activity,
      participants: newParticipants
    });
  };

  // Handle removing a participant
  const handleRemoveParticipant = (playerId: string) => {
    if (!activity.participants) return;
    
    const newParticipants = activity.participants.filter(id => id !== playerId);
    
    updateActivity({
      ...activity,
      participants: newParticipants
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h3 className={isMobile ? "text-lg font-medium mb-2" : "text-lg font-medium"}>
          Deltagare ({participantPlayers.length})
        </h3>
        
        <ParticipantActions 
          activity={activity}
          nonParticipantPlayers={nonParticipantPlayers}
          onAddParticipant={handleAddParticipant}
          isMobile={isMobile}
        />
      </div>
      
      <ParticipantList 
        participants={participantPlayers}
        onRemoveParticipant={handleRemoveParticipant}
        onPlayerSelect={onPlayerSelect}
        isMobile={isMobile}
      />
    </div>
  );
}
