
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
  
  // Check for specific players in the incoming dataset
  const hasAlvin = filteredPlayers.some(p => p.name?.includes("Alvin"));
  console.log("Alvin in incoming filteredPlayers:", hasAlvin);
  
  // When no positions are selected, skip the position filtering altogether
  let displayPlayers = filteredPlayers;
  
  // Only apply position filtering if positions are actually selected
  if (selectedPositions.length > 0) {
    console.log("Applying position filter for:", selectedPositions);
    displayPlayers = filteredPlayers.filter(player => {
      // If player has no positions property or it's not an array, skip this player for position filtering
      if (!player.positions) {
        console.log(`Player ${player.name} has no positions property, skipping position filter`);
        return false;
      }
      
      // Make sure positions is treated as an array
      const positionsArray = Array.isArray(player.positions) ? player.positions : [player.positions];
      
      return positionsArray.some(position => selectedPositions.includes(position));
    });
  }
  
  // Filter out coaches if showCoaches is false
  if (!showCoaches) {
    displayPlayers = displayPlayers.filter(player => {
      // Safely check if player has positions and if it includes "TRÄNARE"
      if (!player.positions) return true; // Keep players without positions
      
      const positionsArray = Array.isArray(player.positions) ? player.positions : [player.positions];
      return !positionsArray.includes("TRÄNARE");
    });
  }
  
  // Final check for specific players
  const hasAlvinAfterFilter = displayPlayers.some(p => p.name?.includes("Alvin"));
  console.log("Alvin in final displayPlayers:", hasAlvinAfterFilter);
  
  // Log for debugging
  console.log("Players to display:", displayPlayers.length);
  
  // If we don't have many players, log them all to help debug
  if (displayPlayers.length > 0 && displayPlayers.length < 50) {
    console.log("Players being displayed:", displayPlayers.map(p => p.name).join(", "));
  }

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
