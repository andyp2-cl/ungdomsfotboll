
import { useState } from "react";
import { PlayerManagement } from "@/components/PlayerManagement";
import { Player } from "@/types/player";

interface PlayerTabContentProps {
  players: Player[];
  activities: any[];
  searchQuery: string;
  selectedGrades: any[];
  selectedPlayer: Player | null;
  viewMode: "grid" | "list";
  filteredPlayers: Player[];
  isAddPlayerOpen: boolean;
  setSearchQuery: (query: string) => void;
  handleGradeChange: (grade: any) => void;
  setSelectedPlayer: (player: Player | null) => void;
  setViewMode: (mode: "grid" | "list") => void;
  handlePlayerUpdate: (player: Player) => void;
  handleBulkPlayerUpdate: (players: Player[]) => void;
  setIsAddPlayerOpen: (isOpen: boolean) => void;
  setEditingPlayer: (player: Player | null) => void;
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
  setIsAddPlayerOpen,
  setEditingPlayer
}: PlayerTabContentProps) {
  return (
    <PlayerManagement 
      players={players}
      activities={activities}
      searchQuery={searchQuery}
      selectedGrades={selectedGrades}
      selectedPlayer={selectedPlayer}
      viewMode="list" // Remove grid view option
      filteredPlayers={filteredPlayers}
      onSearchChange={setSearchQuery}
      onGradeChange={handleGradeChange}
      onPlayerSelect={setSelectedPlayer}
      onViewModeChange={setViewMode}
      onPlayerUpdate={handlePlayerUpdate}
      onBulkPlayerUpdate={handleBulkPlayerUpdate}
      onAddPlayerClick={() => setIsAddPlayerOpen(true)}
      onEditPlayerClick={setEditingPlayer}
    />
  );
}
