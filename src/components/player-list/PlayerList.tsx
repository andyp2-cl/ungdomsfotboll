
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
  
  // Filter out coaches if not requested
  const filteredPlayers = !showCoaches 
    ? players.filter(player => !player.positions?.includes("TRÄNARE"))
    : players;
    
  const sortedPlayers = sortPlayers(filteredPlayers);

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
