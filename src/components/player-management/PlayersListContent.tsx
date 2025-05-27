
import React from "react";
import { Player, PlayerPosition } from "@/types/player";
import { PlayerCard } from "@/components/PlayerCard";
import { sortPlayersByGrade } from "@/utils/gradeUtils";

interface PlayersListContentProps {
  filteredPlayers: Player[];
  viewMode: "grid" | "list";
  selectedPositions: PlayerPosition[];
  onPlayerSelect: (player: Player) => void;
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
    <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-4`}>
      {sortedPlayers.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          onClick={() => {
            console.log("PlayersListContent: Player card clicked:", player.name);
            onPlayerSelect(player);
          }}
          onEdit={() => onPlayerEdit(player)}
        />
      ))}
    </div>
  );
}
