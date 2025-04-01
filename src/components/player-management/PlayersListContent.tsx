
import React from "react";
import { Player, PlayerPosition } from "@/types/player";
import { PlayerList } from "@/components/PlayerList";
import { Button } from "@/components/ui/button";
import { Smartphone } from "lucide-react";

interface PlayersListContentProps {
  filteredPlayers: Player[];
  viewMode: "grid" | "list";
  selectedPositions: PlayerPosition[];
  onPlayerSelect: (player: Player | null) => void;
  onPlayerEdit: (player: Player) => void;
  isMobile: boolean;
}

export function PlayersListContent({
  filteredPlayers,
  viewMode,
  selectedPositions,
  onPlayerSelect,
  onPlayerEdit,
  isMobile
}: PlayersListContentProps) {
  const positionFilteredPlayers = selectedPositions.length > 0
    ? filteredPlayers.filter(player => 
        player.positions?.some(position => selectedPositions.includes(position))
      )
    : filteredPlayers;

  return (
    <div>
      <PlayerList 
        players={positionFilteredPlayers}
        viewMode={viewMode}
        onPlayerSelect={onPlayerSelect}
        onPlayerEdit={onPlayerEdit}
      />
      {isMobile && (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Installera mobilapp
          </Button>
        </div>
      )}
    </div>
  );
}
