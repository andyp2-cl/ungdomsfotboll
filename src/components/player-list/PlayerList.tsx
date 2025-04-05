
import React from "react";
import { Player } from "@/types/player";
import { PlayerListTable } from "./PlayerListTable";
import { PlayerGridView } from "./PlayerGridView";
import { usePlayerSorting } from "./PlayerListSorting";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  // Filter out coaches if not requested
  const filteredPlayers = players;
    
  // Apply sorting
  const sortedPlayers = sortPlayers(filteredPlayers);

  // Force grid view on mobile devices
  const effectiveViewMode = isMobile ? "grid" : viewMode;

  if (effectiveViewMode === "grid") {
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
