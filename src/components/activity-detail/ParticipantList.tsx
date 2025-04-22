
import React from "react";
import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { PlayerList } from "../player-ui";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

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
  
  if (participants.length === 0) {
    return (
      <div className="p-4 text-center border-2 border-dashed rounded-lg border-muted my-4">
        <p className="text-sm text-muted-foreground">Inga deltagare har lagts till än.</p>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <ScrollArea className={isMobileDevice ? "max-h-60" : "max-h-64"}>
        <PlayerList
          players={participants}
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
      </ScrollArea>
    </div>
  );
}
