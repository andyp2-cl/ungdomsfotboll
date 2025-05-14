
import { useState } from "react";
import { Activity, Player, PlayerGrade } from "@/types/player";
import { SearchInput } from "@/components/SearchInput";
import { PlayerFilter } from "@/components/PlayerFilter";
import { Plus } from "lucide-react";
import { PlayerList } from "@/components/player-list/PlayerList";
import { PlayerDetail } from "@/components/PlayerDetail";
import { Button } from "@/components/ui/button";
import { TeamStatistics } from "@/components/TeamStatistics";

interface PlayerTabContentProps {
  players: Player[];
  activities: Activity[];
  searchQuery: string;
  selectedGrades: PlayerGrade[];
  selectedPlayer: Player | null;
  viewMode: "list" | "grid" | "stats";
  filteredPlayers: Player[];
  isAddPlayerOpen: boolean;
  setSearchQuery: (query: string) => void;
  handleGradeChange: (grade: PlayerGrade) => void;
  setSelectedPlayer: (player: Player | null) => void;
  setViewMode: (mode: "list" | "grid" | "stats") => void;
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
        
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setIsAddPlayerOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Lägg till
          </Button>
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
      ) : viewMode === "stats" ? (
        <TeamStatistics 
          players={players} 
          activities={activities}
          onPlayerSelect={setSelectedPlayer}
        />
      ) : (
        <PlayerList 
          players={filteredPlayers}
          onPlayerSelect={setSelectedPlayer}
          onPlayerEdit={setEditingPlayer}
        />
      )}
    </div>
  );
}
