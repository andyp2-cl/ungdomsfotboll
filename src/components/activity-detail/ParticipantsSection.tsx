
import React from "react";
import { Activity, Player } from "@/types/player";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ParticipantList } from "./ParticipantList";
import { ParticipantActionButtons } from "./ParticipantActionButtons";
import { AddPlayersToActivity } from "../AddPlayersToActivity";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { sortPlayersByGrade } from "@/utils/gradeUtils";

interface ParticipantsSectionProps {
  activity: Activity;
  participatingPlayers: Player[];
  isAddingPlayers: boolean;
  setIsAddingPlayers: (isAdding: boolean) => void;
  clearParticipantsDialogOpen: boolean;
  setClearParticipantsDialogOpen: (isOpen: boolean) => void;
  onPlayerSelect?: (playerId: string) => void;
  onRemovePlayer: (playerId: string) => void;
  onClearAllParticipants: () => void;
  onAddPlayers: (playerIds: string[]) => void;
  players: Player[];
}

export function ParticipantsSection({
  activity,
  participatingPlayers,
  isAddingPlayers,
  setIsAddingPlayers,
  clearParticipantsDialogOpen,
  setClearParticipantsDialogOpen,
  onPlayerSelect,
  onRemovePlayer,
  onClearAllParticipants,
  onAddPlayers,
  players
}: ParticipantsSectionProps) {
  const isMobile = useIsMobile();

  // Sort participants by grade (A, B, C, D)
  const sortedParticipants = sortPlayersByGrade(participatingPlayers);

  return (
    <Accordion type="single" collapsible defaultValue="participants" className={isMobile ? "border rounded-lg" : ""}>
      <AccordionItem value="participants" className={isMobile ? "border-none" : ""}>
        <AccordionTrigger className={isMobile ? "px-3 py-2" : "py-2"}>
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            <span>Deltagare ({participatingPlayers.length})</span>
            {participatingPlayers.length === 0 && (
              <Badge variant="outline" className="ml-2">
                Inga deltagare
              </Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className={isMobile ? "px-3 pb-3" : ""}>
          <ParticipantList
            participants={sortedParticipants}
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
            <AddPlayersToActivity 
              activity={activity}
              players={players}
              onAddPlayers={onAddPlayers}
              currentParticipantIds={activity.participants || []}
            />
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
