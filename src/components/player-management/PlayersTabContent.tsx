
import React from "react";
import { Player, PlayerGrade, PlayerPosition } from "@/types/player";
import { Activity } from "@/types/player";
import { PlayerFilter } from "@/components/PlayerFilter";
import { PlayerManagementHeader } from "./PlayerManagementHeader";
import { PlayersListContent } from "./PlayersListContent";
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
        selectedPositions={selectedPositions}
        onPositionChange={onPositionChange}
        activeFiltersCount={activeFiltersCount}
      />
      
      {selectedPlayer ? (
        <PlayerDetail 
          player={selectedPlayer} 
          activities={activities} 
          onClose={() => onPlayerSelect(null)}
          onEdit={onEditPlayerClick}
          onPlayerUpdate={onPlayerUpdate}
          allPlayers={players}
        />
      ) : (
        <PlayersListContent 
          filteredPlayers={filteredPlayers}
          viewMode={viewMode}
          selectedPositions={selectedPositions}
          onPlayerSelect={onPlayerSelect}
          onPlayerEdit={onEditPlayerClick}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}
