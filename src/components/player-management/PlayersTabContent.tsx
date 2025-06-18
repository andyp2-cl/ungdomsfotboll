import React from "react";
import { Player, PlayerGrade, PlayerPosition } from "@/types/player";
import { Activity } from "@/types/player";
import { PlayerDetail } from "@/components/PlayerDetail";
import { PlayerList } from "@/components/player-list/PlayerList";

interface PlayersTabContentProps {
  players: Player[];
  activities: Activity[];
  searchQuery: string;
  selectedGrades: PlayerGrade[];
  selectedPositions: PlayerPosition[];
  activeFiltersCount: number;
  selectedPlayer: Player | null;
  viewMode: "grid" | "list";
  filteredPlayers: Player[];
  onSearchChange: (value: string) => void;
  onGradeChange: (grade: PlayerGrade) => void;
  onPositionChange: (position: PlayerPosition) => void;
  onPlayerSelect: (player: Player | null) => void;
  onPlayerUpdate: (player: Player) => void;
  onAddPlayerClick: () => void;
  onEditPlayerClick: (player: Player) => void;
  isMobile: boolean;
}

export function PlayersTabContent({
  players,
  activities,
  searchQuery,
  selectedGrades,
  selectedPositions,
  activeFiltersCount,
  selectedPlayer,
  viewMode,
  filteredPlayers,
  onSearchChange,
  onGradeChange,
  onPositionChange,
  onPlayerSelect,
  onPlayerUpdate,
  onAddPlayerClick,
  onEditPlayerClick,
  isMobile
}: PlayersTabContentProps) {
  
  // Handle player selection from player card
  const handlePlayerCardClick = (player: Player) => {
    console.log("PlayersTabContent: Player card clicked:", player.name);
    onPlayerSelect(player);
  };

  // Handle bulk update (for single player, just call onPlayerUpdate)
  const handleBulkUpdate = (player: Player) => {
    onPlayerUpdate(player);
  };

  return (
    <div className="space-y-6">
      {selectedPlayer ? (
        <PlayerDetail 
          player={selectedPlayer} 
          activities={activities} 
          onClose={() => {
            console.log("PlayersTabContent: Closing player detail view");
            onPlayerSelect(null);
          }}
          onEdit={onEditPlayerClick}
          onPlayerUpdate={onPlayerUpdate}
          onBulkUpdate={handleBulkUpdate}
          allPlayers={players}
        />
      ) : (
        <PlayerList 
          players={filteredPlayers}
          activities={activities}
          onPlayerSelect={handlePlayerCardClick}
          onPlayerEdit={onEditPlayerClick}
        />
      )}
    </div>
  );
}
