
import React from "react";
import { Player, PlayerPosition } from "@/types/player";
import { PlayerCard } from "@/components/player-ui/PlayerCard";
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

  // På mobil, använd en ultra kompakt lista för att visa många spelare utan scrollning
  if (isMobile) {
    return (
      <div className="w-full bg-white rounded border">
        <div className="px-2 py-1 bg-gray-50 border-b text-xs font-medium text-gray-600">
          {sortedPlayers.length} spelare
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {sortedPlayers.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onSelect={() => {
                console.log("PlayersListContent: Player card clicked:", player.name);
                onPlayerSelect(player);
              }}
              onEdit={() => onPlayerEdit(player)}
              compact={true}
              isMobile={true}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-4`}>
      {sortedPlayers.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          onSelect={() => {
            console.log("PlayersListContent: Player card clicked:", player.name);
            onPlayerSelect(player);
          }}
          onEdit={() => onPlayerEdit(player)}
        />
      ))}
    </div>
  );
}
