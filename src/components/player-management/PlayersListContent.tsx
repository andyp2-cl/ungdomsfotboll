
import React from "react";
import { Player, PlayerPosition } from "@/types/player";
import { PlayerList } from "@/components/player-list/PlayerList";
import { Button } from "@/components/ui/button";
import { Smartphone } from "lucide-react";

interface PlayersListContentProps {
  filteredPlayers: Player[];
  viewMode: "grid" | "list";
  selectedPositions: PlayerPosition[];
  onPlayerSelect: (player: Player | null) => void;
  onPlayerEdit: (player: Player) => void;
  isMobile: boolean;
  showCoaches?: boolean;
}

export function PlayersListContent({
  filteredPlayers,
  viewMode,
  selectedPositions,
  onPlayerSelect,
  onPlayerEdit,
  isMobile,
  showCoaches = true
}: PlayersListContentProps) {
  // Log for debugging
  console.log("PlayersListContent received players:", filteredPlayers.length);
  
  // We'll adjust this position filter to be more defensive
  const positionFilteredPlayers = selectedPositions.length > 0
    ? filteredPlayers.filter(player => {
        // Check if player has positions and it's an array
        if (!player.positions || !Array.isArray(player.positions)) {
          return false;
        }
        return player.positions.some(position => selectedPositions.includes(position));
      })
    : filteredPlayers;
  
  // Filter out coaches if showCoaches is false
  const displayPlayers = !showCoaches
    ? positionFilteredPlayers.filter(player => 
        !player.positions?.includes("TRÄNARE")
      )
    : positionFilteredPlayers;
  
  // Log for debugging
  console.log("Players to display:", displayPlayers.length);

  return (
    <div>
      <PlayerList 
        players={displayPlayers}
        viewMode={viewMode}
        onPlayerSelect={onPlayerSelect}
        onPlayerEdit={onPlayerEdit}
        showCoaches={showCoaches}
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
