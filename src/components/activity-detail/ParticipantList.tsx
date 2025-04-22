
import React from "react";
import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { PlayerList } from "../player-ui";

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
  if (participants.length === 0) {
    return (
      <div className="p-4 text-center border-2 border-dashed rounded-lg border-muted my-4">
        <p className="text-sm text-muted-foreground">Inga deltagare har lagts till än.</p>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <PlayerList
        players={participants}
        onPlayerSelect={player => onPlayerSelect?.(player.id)}
        compact={true}
        emptyMessage="Inga deltagare att visa"
        className="max-h-64 overflow-y-auto"
      />
    </div>
  );
}
