import React from "react";
import { Player, PlayerPosition } from "@/types/player";
import { PlayerCard } from "@/components/PlayerCard";
import { sortPlayersByGrade } from "@/utils/gradeUtils";
import { PlayerListTable } from "../player-list/PlayerListTable";

interface PlayersListContentProps {
  filteredPlayers: Player[];
  viewMode: "grid" | "list";
  selectedPositions: PlayerPosition[];
  onPlayerSelect: (player: Player) => void;
  onPlayerEdit: (player: Player) => void;
  isMobile: boolean;
  visibleColumns?: string[];
}

export function PlayersListContent({
  filteredPlayers,
  viewMode,
  selectedPositions,
  onPlayerSelect,
  onPlayerEdit,
  isMobile,
  visibleColumns
}: PlayersListContentProps) {
  
  // Sort players by grade for consistent display
  const sortedPlayers = sortPlayersByGrade(filteredPlayers);

  if (filteredPlayers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Inga spelare matchar de valda filtren
      </div>
    );
  }

  return (
    <PlayerListTable
      players={sortedPlayers}
      visibleColumns={visibleColumns}
    />
  );
}
