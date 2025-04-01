
import React from "react";
import { Player, Activity } from "@/types/player";
import { usePlayerSelection } from "./player-selection/usePlayerSelection";
import { PlayerSearchPopover } from "./player-selection/PlayerSearchPopover";
import { SelectedPlayersList } from "./player-selection/SelectedPlayersList";
import { QuickSelectPlayers } from "./player-selection/QuickSelectPlayers";
import { AddPlayersButton } from "./player-selection/AddPlayersButton";

interface AddPlayersToActivityProps {
  activity: Activity;
  players: Player[];
  onAddPlayers: (playerIds: string[]) => void;
  currentParticipantIds: string[];
}

export function AddPlayersToActivity({ 
  activity, 
  players, 
  onAddPlayers, 
  currentParticipantIds 
}: AddPlayersToActivityProps) {
  const {
    selectedPlayers,
    availablePlayers,
    handlePlayerSelect,
    handleAddPlayers,
    handleSinglePlayerAdd
  } = usePlayerSelection({
    activity,
    players,
    currentParticipantIds,
    onAddPlayers
  });

  return (
    <div className="space-y-4 mt-4">
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <PlayerSearchPopover 
          availablePlayers={availablePlayers}
          selectedPlayers={selectedPlayers}
          onPlayerSelect={handlePlayerSelect}
          currentParticipantCount={currentParticipantIds.length}
        />
        
        <AddPlayersButton 
          selectedCount={selectedPlayers.length}
          onAddPlayers={handleAddPlayers}
        />
      </div>

      <SelectedPlayersList 
        selectedPlayerIds={selectedPlayers}
        players={players}
        onRemovePlayer={handlePlayerSelect}
      />

      {availablePlayers.length > 0 && (
        <QuickSelectPlayers 
          availablePlayers={availablePlayers}
          onSelectPlayer={handleSinglePlayerAdd}
        />
      )}
    </div>
  );
}
