
import { useState } from "react";
import { Activity, Player, PlayerGrade } from "@/types/player";
import { SearchInput } from "@/components/SearchInput";
import { PlayerFilter } from "@/components/PlayerFilter";
import { PlayerList } from "@/components/player-list/PlayerList";
import { PlayerDetail } from "@/components/PlayerDetail";
import { TeamStatistics } from "@/components/TeamStatistics";

interface PlayerTabContentProps {
  players: Player[];
  activities: Activity[];
  searchQuery: string;
  selectedGrades: PlayerGrade[];
  selectedPlayer: Player | null;
  viewMode: "list" | "grid";
  filteredPlayers: Player[];
  isAddPlayerOpen: boolean;
  setSearchQuery: (query: string) => void;
  handleGradeChange: (grade: PlayerGrade) => void;
  setSelectedPlayer: (player: Player | null) => void;
  setViewMode: (mode: "list" | "grid") => void;
  handlePlayerUpdate: (player: Player) => void;
  handleBulkPlayerUpdate: (players: Player[]) => void;
  handleDeletePlayer?: (playerId: string) => Promise<void>;
  setIsAddPlayerOpen: (isOpen: boolean) => void;
  setEditingPlayer: (player: Player | null) => void;
  onActivitySelect?: (activity: Activity) => void;
}

export function PlayerTabContent({
  players,
  activities,
  searchQuery,
  selectedGrades,
  selectedPlayer,
  viewMode,
  filteredPlayers,
  isAddPlayerOpen,
  setSearchQuery,
  handleGradeChange,
  setSelectedPlayer,
  setViewMode,
  handlePlayerUpdate,
  handleBulkPlayerUpdate,
  handleDeletePlayer,
  setIsAddPlayerOpen,
  setEditingPlayer,
  onActivitySelect
}: PlayerTabContentProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto flex-grow space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
          <SearchInput 
            placeholder="Sök spelare..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
          
          <PlayerFilter 
            selectedGrades={selectedGrades} 
            onGradeChange={handleGradeChange}
          />
        </div>
      </div>
      
      {selectedPlayer ? (
        <PlayerDetail 
          player={selectedPlayer}
          activities={activities}
          onClose={() => setSelectedPlayer(null)}
          onEdit={setEditingPlayer}
          onPlayerUpdate={handlePlayerUpdate}
          onPlayerDelete={handleDeletePlayer}
          onBulkUpdate={(player) => handleBulkPlayerUpdate([player])}
          allPlayers={players}
          onActivitySelect={onActivitySelect}
        />
      ) : (
        <PlayerList 
          players={filteredPlayers}
          activities={activities}
          onPlayerSelect={setSelectedPlayer}
          onPlayerEdit={setEditingPlayer}
        />
      )}
    </div>
  );
}
