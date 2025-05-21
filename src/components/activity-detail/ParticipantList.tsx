import React from "react";
import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { PlayerList } from "../player-ui";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { sortPlayersByGrade } from "@/utils/gradeUtils";

interface ParticipantListProps {
  participants: Player[];
  onPlayerSelect?: (playerId: string) => void;
  onRemovePlayer: (playerId: string) => void;
  isMobile?: boolean;
}

export function ParticipantList({
  participants,
  onPlayerSelect,
  onRemovePlayer,
  isMobile = false
}: ParticipantListProps) {
  const isMobileDevice = useIsMobile();
  
  // We're now using the shared sortPlayersByGrade function
  // Note: This is actually redundant since the participants are already sorted
  // in the parent component (ParticipantsSection), but we keep it for consistency and safety
  const sortedParticipants = sortPlayersByGrade(participants);
  
  if (sortedParticipants.length === 0) {
    return (
      <div className="p-4 text-center border-2 border-dashed rounded-lg border-muted my-4">
        <p className="text-sm text-muted-foreground">Inga deltagare har lagts till än.</p>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <ScrollArea className={isMobileDevice ? "h-[calc(60vh-100px)]" : "h-[60vh]"}>
        <div className="pr-4 py-2">
          <PlayerList
            players={sortedParticipants}
            onPlayerSelect={player => onPlayerSelect?.(player.id)}
            onPlayerAction={(player) => (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={(e) => {
                  e.stopPropagation();
                  onRemovePlayer(player.id);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            compact={true}
            emptyMessage="Inga deltagare att visa"
            className="overflow-y-visible px-1"
          />
        </div>
      </ScrollArea>
    </div>
  );
}
