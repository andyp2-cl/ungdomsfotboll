
import React from "react";
import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { PlayerAvatar } from "@/components/player-selection/PlayerAvatar";
import { useIsMobile } from "@/hooks/use-mobile";

interface PlayerQuickSelectProps {
  availablePlayers: Player[];
  onQuickSelect: (playerId: string) => void;
}

export function PlayerQuickSelect({ availablePlayers, onQuickSelect }: PlayerQuickSelectProps) {
  const isMobile = useIsMobile();
  
  if (availablePlayers.length === 0) return null;

  // Calculate how many players to show based on screen size
  const playersToShow = isMobile ? 4 : 8;

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">Snabbval:</h4>
      <div className="flex flex-wrap gap-2">
        {availablePlayers.slice(0, playersToShow).map(player => (
          <Button 
            key={player.id}
            variant="outline" 
            size="sm"
            onClick={() => onQuickSelect(player.id)}
            className="flex items-center gap-2"
          >
            <PlayerAvatar player={player} size="xs" />
            <span className="truncate max-w-[100px]">{player.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
