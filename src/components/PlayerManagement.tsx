
import React, { useEffect, useState } from "react";
import { Player, Activity, PlayerGrade, PlayerPosition } from "@/types/player";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp } from "lucide-react";
import { PlayersTabContent } from "./player-management/PlayersTabContent";
import { StatisticsTabsWrapper } from "./player-management/statistics/StatisticsTabsWrapper";
import { AnalyticsTabContent } from "./player-management/AnalyticsTabContent";

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
  const { isMobile } = useIsMobile();
  const [activeTab, setActiveTab] = useState<"players" | "statistics" | "analytics">("players");
  const [selectedPositions, setSelectedPositions] = useState<PlayerPosition[]>([]);
  
  useEffect(() => {
    // Always force list view
    if (viewMode === "grid") {
      onViewModeChange("list");
    }
  }, [viewMode, onViewModeChange]);

  const handlePositionChange = (position: PlayerPosition) => {
    setSelectedPositions(prev => 
      prev.includes(position) 
        ? prev.filter(p => p !== position) 
        : [...prev, position]
    );
  };

  // Handler for player selection by ID
  const handlePlayerIdSelect = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      onPlayerSelect(player);
    }
  };

  // Handler for activity selection
  const handleActivitySelect = (activity: Activity) => {
    console.log("PlayerManagement: Activity selected:", activity.id, activity.name);
    // You can add activity selection logic here if needed
  };

  const activeFiltersCount = selectedPositions.length;

  const playerGradeCounts = players.reduce((acc, player) => {
    if (player.positions?.includes("TRÄNARE")) return acc;
    
    const grade = player.grade;
    if (!acc[grade]) {
      acc[grade] = { grade, players: 0 };
    }
    acc[grade].players += 1;
    return acc;
  }, {} as Record<string, { grade: string, players: number }>);

  const gradeData = Object.values(playerGradeCounts);

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
            <TrendingUp className="h-4 w-4" />
            Avancerad analys
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="players">
          <PlayersTabContent 
            players={players}
            activities={activities}
            searchQuery={searchQuery}
            selectedGrades={selectedGrades}
            selectedPositions={selectedPositions}
            activeFiltersCount={activeFiltersCount}
            selectedPlayer={selectedPlayer}
            viewMode="list"
            filteredPlayers={filteredPlayers}
            onSearchChange={onSearchChange}
            onGradeChange={onGradeChange}
            onPositionChange={handlePositionChange}
            onPlayerSelect={onPlayerSelect}
            onPlayerUpdate={onPlayerUpdate}
            onAddPlayerClick={onAddPlayerClick}
            onEditPlayerClick={onEditPlayerClick}
            isMobile={isMobile}
          />
        </TabsContent>
        
        <TabsContent value="statistics">
          <StatisticsTabsWrapper 
            players={players} 
            activities={activities}
            gradeData={gradeData}
            onActivitySelect={handleActivitySelect}
            onPlayerSelect={handlePlayerIdSelect}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTabContent 
            players={players}
            activities={activities}
            gradeData={gradeData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
