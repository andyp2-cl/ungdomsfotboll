
import React, { useState } from "react";
import { Player, PlayerGrade, Activity } from "@/types/player";
import { SearchInput } from "@/components/SearchInput";
import { PlayerFilter } from "@/components/PlayerFilter";
import { PlayerCard } from "@/components/PlayerCard";
import { PlayerDetail } from "@/components/PlayerDetail";
import { PlayerList } from "@/components/PlayerList";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Grid, List, UserPlus } from "lucide-react";

interface PlayerManagementProps {
  players: Player[];
  activities: Activity[];
  searchQuery: string;
  selectedGrades: PlayerGrade[];
  selectedPlayer: Player | null;
  viewMode: "grid" | "list";
  filteredPlayers: Player[];
  onSearchChange: (value: string) => void;
  onGradeChange: (grade: PlayerGrade) => void;
  onPlayerSelect: (player: Player | null) => void;
  onViewModeChange: (value: "grid" | "list") => void;
  onPlayerUpdate: (player: Player) => void;
  onAddPlayerClick: () => void;
  onEditPlayerClick: (player: Player) => void;
}

export function PlayerManagement({
  players,
  activities,
  searchQuery,
  selectedGrades,
  selectedPlayer,
  viewMode,
  filteredPlayers,
  onSearchChange,
  onGradeChange,
  onPlayerSelect,
  onViewModeChange,
  onPlayerUpdate,
  onAddPlayerClick,
  onEditPlayerClick
}: PlayerManagementProps) {
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-2/3">
          <SearchInput value={searchQuery} onChange={onSearchChange} />
        </div>
        <div className="w-full md:w-1/3">
          <PlayerFilter 
            selectedGrades={selectedGrades} 
            onGradeChange={onGradeChange} 
          />
        </div>
      </div>

      {!selectedPlayer && (
        <div className="flex justify-between items-center mb-4">
          <Button 
            onClick={onAddPlayerClick}
            className="mb-4"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Lägg till spelare
          </Button>
          
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && onViewModeChange(value as "grid" | "list")}>
            <ToggleGroupItem value="grid" aria-label="Visa som rutnät">
              <Grid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="Visa som lista">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}

      {selectedPlayer ? (
        <PlayerDetail 
          player={selectedPlayer} 
          activities={activities}
          onClose={() => onPlayerSelect(null)} 
          onPlayerUpdate={onPlayerUpdate}
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map(player => (
              <PlayerCard 
                key={player.id} 
                player={player} 
                onClick={() => onPlayerSelect(player)}
                onEdit={onEditPlayerClick}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground">Inga spelare hittades</p>
            </div>
          )}
        </div>
      ) : (
        <PlayerList
          players={filteredPlayers}
          onSelect={onPlayerSelect}
          onEdit={onEditPlayerClick}
        />
      )}
    </div>
  );
}
