
import { Player, Activity, PlayerGrade, PlayerPosition } from "@/types/player";
import { PlayerFilter } from "@/components/PlayerFilter";
import { SearchInput } from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import { PlayerList } from "@/components/PlayerList";
import { PlayerDetail } from "@/components/PlayerDetail";
import { Grid, List, Plus, BarChart3, Smartphone } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { TeamStatistics } from "@/components/TeamStatistics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayerSummaryCard } from "@/components/charts/PlayerSummaryCard";

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
  onBulkPlayerUpdate?: (players: Player[]) => void;
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
  const [activeTab, setActiveTab] = useState<"players" | "statistics" | "analytics">("players");
  const [selectedPositions, setSelectedPositions] = useState<PlayerPosition[]>([]);
  
  // Always use list view on mobile
  useEffect(() => {
    if (isMobile && viewMode === "grid") {
      onViewModeChange("list");
    }
  }, [isMobile, viewMode, onViewModeChange]);

  // Handle position filtering
  const handlePositionChange = (position: PlayerPosition) => {
    setSelectedPositions(prev => 
      prev.includes(position) 
        ? prev.filter(p => p !== position) 
        : [...prev, position]
    );
  };

  // Calculate active filters count
  const activeFiltersCount = selectedPositions.length;

  // Get player counts by grade for summary card
  const playerGradeCounts = players.reduce((acc, player) => {
    // Skip trainers
    if (player.positions?.includes("TRÄNARE")) return acc;
    
    const grade = player.grade;
    if (!acc[grade]) {
      acc[grade] = { grade, players: 0 };
    }
    acc[grade].players += 1;
    return acc;
  }, {} as Record<string, { grade: string, players: number }>);

  // Convert to array for the card
  const gradeData = Object.values(playerGradeCounts);

  // Filter players with positions filter
  const positionFilteredPlayers = selectedPositions.length > 0
    ? filteredPlayers.filter(player => 
        player.positions?.some(position => selectedPositions.includes(position))
      )
    : filteredPlayers;

  return (
    <div className="grid grid-cols-1 gap-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "players" | "statistics" | "analytics")}>
        <TabsList className="mb-4">
          <TabsTrigger value="players">Spelare</TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            Statistik
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            Rapporter
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
            selectedPositions={selectedPositions}
            onPositionChange={handlePositionChange}
            activeFiltersCount={activeFiltersCount}
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
                players={positionFilteredPlayers}
                viewMode={viewMode}
                onPlayerSelect={onPlayerSelect}
                onPlayerEdit={onEditPlayerClick}
              />
              {isMobile && (
                <div className="mt-6 flex justify-center">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Installera mobilapp
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="statistics">
          <TeamStatistics players={players} activities={activities} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PlayerSummaryCard data={gradeData} />
            
            <div className="col-span-1 md:col-span-2">
              <PlayerAttendanceAnalytics 
                players={players}
                activities={activities}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
