
import React from "react";
import { Player } from "@/types/player";
import { PlayerListTable } from "./PlayerListTable";
import { PlayerGridView } from "./PlayerGridView";
import { usePlayerSorting } from "./PlayerListSorting";

interface PlayerListProps {
  players: Player[];
  viewMode?: "grid" | "list";
  onPlayerSelect: (player: Player) => void;
  onPlayerEdit?: (player: Player) => void;
  showCoaches?: boolean;
}

export function PlayerList({ 
  players, 
  viewMode = "list", 
  onPlayerSelect, 
  onPlayerEdit,
  showCoaches = true
}: PlayerListProps) {
  const { sortField, sortDirection, toggleSort, sortPlayers } = usePlayerSorting();
  
  // Log for debugging what's coming into PlayerList
  console.log("PlayerList received players:", players.length);
  const hasAlvin = players.some(p => p.name?.includes("Alvin"));
  console.log("Alvin in PlayerList:", hasAlvin);
  
  // Filter out coaches if not requested - we'll do this here as a safety check
  // even though it's already done in PlayersListContent
  const filteredPlayers = !showCoaches 
    ? players.filter(player => {
        if (!player.positions) return true;
        const positionsArray = Array.isArray(player.positions) ? player.positions : [player.positions];
        return !positionsArray.includes("TRÄNARE");
      })
    : players;
    
  // Apply sorting
  const sortedPlayers = sortPlayers(filteredPlayers);
  
  // Final debug check
  console.log("PlayerList final player count:", sortedPlayers.length);

  if (viewMode === "grid") {
    return (
      <PlayerGridView 
        players={sortedPlayers} 
        onPlayerSelect={onPlayerSelect} 
        onPlayerEdit={onPlayerEdit} 
      />
    );
  }

  return (
    <PlayerListTable 
      players={sortedPlayers} 
      sortField={sortField} 
      sortDirection={sortDirection} 
      toggleSort={toggleSort} 
      onPlayerSelect={onPlayerSelect} 
      onPlayerEdit={onPlayerEdit} 
    />
  );
}
