
import React from "react";
import { Player, Activity } from "@/types/player";
import { PlayerListTable } from "./PlayerListTable";
import { PlayerGridView } from "./PlayerGridView";
import { usePlayerSorting } from "./PlayerListSorting";
import { useIsMobile } from "@/hooks/use-mobile";

interface PlayerListProps {
  players: Player[];
  activities?: Activity[];
  viewMode?: "grid" | "list";
  onPlayerSelect: (player: Player) => void;
  onPlayerEdit?: (player: Player) => void;
  showCoaches?: boolean;
}

export function PlayerList({ 
  players, 
  activities = [],
  viewMode = "list", 
  onPlayerSelect, 
  onPlayerEdit,
  showCoaches = true
}: PlayerListProps) {
  const { sortField, sortDirection, toggleSort, sortPlayers } = usePlayerSorting(activities);
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
        activities={activities}
        onPlayerSelect={onPlayerSelect} 
        onPlayerEdit={onPlayerEdit} 
      />
    );
  }

  return (
    <PlayerListTable 
      players={sortedPlayers} 
      activities={activities}
      sortField={sortField} 
      sortDirection={sortDirection} 
      toggleSort={toggleSort} 
      onPlayerSelect={onPlayerSelect} 
      onPlayerEdit={onPlayerEdit} 
    />
  );
}
