
import React from "react";
import { Player, PlayerGrade, PlayerPosition } from "@/types/player";
import { Activity } from "@/types/player";
import { PlayerFilter } from "@/components/PlayerFilter";
import { PlayerManagementHeader } from "./PlayerManagementHeader";
import { PlayerList } from "@/components/player-list/PlayerList";
import { PlayerDetail } from "@/components/PlayerDetail";

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
  
  // Handle player selection from player list
  const handlePlayerSelect = (player: Player) => {
    console.log("PlayersTabContent: Player selected:", player.name);
    onPlayerSelect(player);
  };

  // Handle bulk update (for single player, just call onPlayerUpdate)
  const handleBulkUpdate = (player: Player) => {
    onPlayerUpdate(player);
  };

  return (
    <div className="space-y-6">
      <PlayerManagementHeader
        searchQuery={searchQuery}
        viewMode={viewMode}
        onSearchChange={onSearchChange}
        onViewModeChange={(mode) => mode}
        onAddPlayerClick={onAddPlayerClick}
        isMobile={isMobile}
      />
      
      <PlayerFilter 
        selectedGrades={selectedGrades} 
        onGradeChange={onGradeChange}
      />
      
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
          viewMode="list"
          onPlayerSelect={handlePlayerSelect}
          onPlayerEdit={onEditPlayerClick}
          showCoaches={true}
        />
      )}
    </div>
  );
}
