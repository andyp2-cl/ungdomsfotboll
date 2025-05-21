
import React from "react";
import { Player, Activity } from "@/types/player";
import { ParticipantList } from "./ParticipantList";
import { ParticipantActionButtons } from "./ParticipantActionButtons";
import { AddPlayersToActivity } from "@/components/AddPlayersToActivity";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";

interface ParticipantsSectionProps {
  activity: Activity;
  participatingPlayers: Player[];
  players: Player[];
  isAddingPlayers: boolean;
  setIsAddingPlayers: (isAdding: boolean) => void;
  clearParticipantsDialogOpen: boolean;
  setClearParticipantsDialogOpen: (isOpen: boolean) => void;
  onPlayerSelect?: (playerId: string) => void;
  onRemovePlayer: (playerId: string) => void;
  onClearAllParticipants: () => void;
  onAddPlayers: (playerIds: string[]) => void;
}

export function ParticipantsSection({
  activity,
  participatingPlayers,
  players,
  isAddingPlayers,
  setIsAddingPlayers,
  clearParticipantsDialogOpen,
  setClearParticipantsDialogOpen,
  onPlayerSelect,
  onRemovePlayer,
  onClearAllParticipants,
  onAddPlayers
}: ParticipantsSectionProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-4">
      <Card className={`${isMobile ? 'overflow-visible' : ''}`}>
        <CardContent className={`${isMobile ? 'p-3' : 'p-6'} space-y-4`}>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Deltagare ({participatingPlayers.length})</h3>
          </div>
          
          <ParticipantList 
            participants={participatingPlayers}
            onPlayerSelect={onPlayerSelect}
            onRemovePlayer={onRemovePlayer}
            isMobile={isMobile}
          />
          
          <ParticipantActionButtons
            isAddingPlayers={isAddingPlayers}
            setIsAddingPlayers={setIsAddingPlayers}
            participantCount={participatingPlayers.length}
            handleClearAllParticipants={onClearAllParticipants}
            isOpen={clearParticipantsDialogOpen}
            setIsOpen={setClearParticipantsDialogOpen}
          />
          
          {isAddingPlayers && (
            <div className={`${isMobile ? 'mt-4' : ''}`}>
              <AddPlayersToActivity 
                activity={activity}
                players={players}
                onAddPlayers={onAddPlayers}
                currentParticipantIds={participatingPlayers.map(p => p.id)}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
