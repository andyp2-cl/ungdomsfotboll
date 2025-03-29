
import { Player, Activity, PlayerGrade } from "@/types/player";
import { PlayerFilter } from "@/components/PlayerFilter";
import { SearchInput } from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import { PlayerList } from "@/components/PlayerList";
import { PlayerDetail } from "@/components/PlayerDetail";
import { Grid, List, Plus, BarChart3 } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { TeamStatistics } from "@/components/TeamStatistics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  onBulkPlayerUpdate?: (players: Player[]) => void; // New prop for bulk updates
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
  onBulkPlayerUpdate,
  onAddPlayerClick,
  onEditPlayerClick,
}: PlayerManagementProps) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<"players" | "statistics">("players");
  
  // Always use list view on mobile
  useEffect(() => {
    if (isMobile && viewMode === "grid") {
      onViewModeChange("list");
    }
  }, [isMobile, viewMode, onViewModeChange]);

  return (
    <div className="grid grid-cols-1 gap-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "players" | "statistics")}>
        <TabsList className="max-w-[400px] mb-4">
          <TabsTrigger value="players">Spelare</TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            Statistik
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="players" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="w-full md:w-1/2 xl:w-1/3">
              <SearchInput 
                value={searchQuery} 
                onChange={onSearchChange} 
                placeholder="Sök spelare..."
              />
            </div>
            <div className="flex items-center gap-2">
              {/* Hide toggle view on mobile */}
              {!isMobile && (
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
              )}
              
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
            <div>
              <PlayerList 
                players={filteredPlayers} 
                viewMode={viewMode}
                onPlayerSelect={onPlayerSelect}
                onPlayerEdit={onEditPlayerClick}
              />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="statistics">
          <TeamStatistics players={players} activities={activities} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
