
import React, { useState } from "react";
import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PlayerAvatar } from "@/components/player-selection/PlayerAvatar";

interface PlayerQuickSelectProps {
  availablePlayers: Player[];
  onQuickSelect: (playerId: string) => void;
  isMobile?: boolean;
}

export function PlayerQuickSelect({
  availablePlayers,
  onQuickSelect,
  isMobile = false
}: PlayerQuickSelectProps) {
  const [processingPlayer, setProcessingPlayer] = useState<string | null>(null);

  const handleQuickSelect = async (playerId: string) => {
    setProcessingPlayer(playerId);
    try {
      await onQuickSelect(playerId);
    } finally {
      setTimeout(() => setProcessingPlayer(null), 500); // Reset after a small delay for UX
    }
  };

  if (availablePlayers.length === 0) return null;

  // Show more players in the quick select list on mobile
  const displayCount = isMobile ? 12 : 5;

  return (
    <div className="space-y-2">
      <h4 className={`${isMobile ? 'text-base' : 'text-sm'} font-medium text-center`}>
        {isMobile ? 'Snabbval av spelare' : 'Snabbval'}
      </h4>
      
      <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-1 gap-1'}`}>
        {availablePlayers.slice(0, displayCount).map(player => (
          <Button
            key={player.id}
            variant="outline"
            size={isMobile ? "default" : "sm"}
            className={`${isMobile ? 'py-5' : 'py-3'} w-full justify-start`}
            onClick={() => handleQuickSelect(player.id)}
            disabled={processingPlayer === player.id}
          >
            {processingPlayer === player.id ? (
              <Loader2 className="h-5 w-5 mr-3 animate-spin" />
            ) : (
              <PlayerAvatar player={player} size={isMobile ? "md" : "sm"} />
            )}
            <span className={`truncate ${isMobile ? "text-base" : ""} ml-2`}>{player.name}</span>
          </Button>
        ))}
      </div>
      
      {availablePlayers.length > displayCount && (
        <div className="text-center mt-2">
          <Separator className="my-2" />
          <p className="text-xs text-muted-foreground">
            +{availablePlayers.length - displayCount} fler spelare
          </p>
        </div>
      )}
    </div>
  );
}
