
import React from "react";
import { Player, Activity } from "@/types/player";
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
  activities?: Activity[]; // Add activities prop
}

export function PlayerList({ 
  players, 
  viewMode = "list", 
  onPlayerSelect, 
  onPlayerEdit,
  showCoaches = true,
  activities = []
}: PlayerListProps) {
  const { sortField, sortDirection, toggleSort, sortPlayers } = usePlayerSorting();
  const isMobile = useIsMobile();
  
  // Filter out coaches if showCoaches is false
  const filteredPlayers = showCoaches 
    ? players
    : players.filter(player => {
        if (!player.positions) return true;
        return !player.positions.includes('TRÄNARE');
      });
    
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
        activities={activities}
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
