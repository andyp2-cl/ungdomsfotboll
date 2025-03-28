
import { Player, Activity, PlayerGrade } from "@/types/player";
import { PlayerFilter } from "@/components/PlayerFilter";
import { SearchInput } from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import { PlayerList } from "@/components/PlayerList";
import { PlayerDetail } from "@/components/PlayerDetail";
import { Grid, List, Plus } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { PlayerImageScraper } from "@/components/PlayerImageScraper";

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
  onViewModeChange: (mode: "grid" | "list") => void;
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
  onEditPlayerClick,
}: PlayerManagementProps) {
  const isMobile = useIsMobile();
  
  // Set default view to list on mobile
  useEffect(() => {
    if (isMobile && viewMode === "grid") {
      onViewModeChange("list");
    }
  }, [isMobile, viewMode, onViewModeChange]);

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="w-full md:w-1/2 xl:w-1/3">
          <SearchInput 
            value={searchQuery} 
            onChange={onSearchChange} 
            placeholder="Sök spelare..."
          />
        </div>
        <div className="flex items-center gap-2">
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => {
            if (value) onViewModeChange(value as "grid" | "list");
          }}>
            <ToggleGroupItem value="grid" aria-label="Rutnätsvy">
              <Grid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="Listvy">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          
          <Button onClick={onAddPlayerClick}>
            <Plus className="h-4 w-4 mr-2" />
            Lägg till spelare
          </Button>
        </div>
      </div>
      
      <PlayerFilter 
        selectedGrades={selectedGrades} 
        onGradeChange={onGradeChange} 
      />
      
      {selectedPlayer ? (
        <PlayerDetail 
          player={selectedPlayer} 
          activities={activities} 
          onClose={() => onPlayerSelect(null)}
          onPlayerUpdate={onPlayerUpdate}
          allPlayers={players}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <PlayerList 
              players={filteredPlayers} 
              viewMode={viewMode}
              onPlayerSelect={onPlayerSelect}
              onPlayerEdit={onEditPlayerClick}
            />
          </div>
          
          <div className="md:col-span-1">
            <PlayerImageScraper 
              players={players} 
              onImagesScraped={(updatedPlayers) => {
                // Update all players at once
                updatedPlayers.forEach(player => {
                  if (player.image) {
                    onPlayerUpdate(player);
                  }
                });
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
