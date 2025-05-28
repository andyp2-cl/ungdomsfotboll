
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Player } from "@/types/player";
import { PlayerList } from "@/components/player-list/PlayerList";
import { PlayerDetail } from "@/components/PlayerDetail";
import { SearchInput } from "@/components/SearchInput";
import { PlayerFilter } from "@/components/PlayerFilter";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddPlayerDialog } from "@/components/dialogs/AddPlayerDialog";
import { EditPlayerDialog } from "@/components/dialogs/EditPlayerDialog";
import { StatisticsTabsWrapper } from "@/components/player-management/statistics/StatisticsTabsWrapper";
import { ActivityTabContent } from "@/components/tabs/activity-tab/ActivityTabContent";

interface PlayersPageContentProps {
  // Tab state
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Player data
  players: Player[];
  activities: Activity[];
  filteredPlayers: Player[];
  selectedPlayer: Player | null;
  setSelectedPlayer: (player: Player | null) => void;
  editingPlayer: Player | null;
  setEditingPlayer: (player: Player | null) => void;
  isAddPlayerOpen: boolean;
  setIsAddPlayerOpen: (isOpen: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedGrades: string[];
  viewMode: string;
  setViewMode: (mode: string) => void;
  handleGradeChange: (grade: string) => void;
  handlePlayerUpdate: (player: Player) => Promise<void>;
  handleBulkPlayerUpdate: (players: Player[]) => Promise<void>;
  handleAddPlayer: (player: Player) => Promise<void>;
  handleDeletePlayer: (playerId: string) => Promise<void>;
  
  // Activity data
  filteredActivities: Activity[];
  filteredHistoricalActivities: Activity[];
  selectedActivity: Activity | null;
  setSelectedActivity: (activity: Activity | null) => void;
  editingActivity: Activity | null;
  setEditingActivity: (activity: Activity | null) => void;
  isAddActivityOpen: boolean;
  setIsAddActivityOpen: (isOpen: boolean) => void;
  selectedActivityTypes: string[];
  handleActivityTypeChange: (type: string) => void;
  handleActivityUpdate: (activity: Activity) => Promise<void>;
  handleKioskUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  handleDelete: (activityId: string) => Promise<boolean>;
  handleImportActivities: (activities: Activity[]) => Promise<boolean>;
  handleClearHistorical: () => Promise<boolean>;
  handleAddActivity: (activity: Activity) => Promise<void>;
  onPlayerActivitySelect: (activity: Activity) => void;
  handleMatchResultUpdate: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
  onPlayerSelect: (playerId: string) => void;
}

export function PlayersPageContent({
  // Tab state
  activeTab,
  setActiveTab,
  
  // Player data  
  players,
  activities,
  filteredPlayers,
  selectedPlayer,
  setSelectedPlayer,
  editingPlayer,
  setEditingPlayer,
  isAddPlayerOpen,
  setIsAddPlayerOpen,
  searchQuery,
  setSearchQuery,
  selectedGrades,
  viewMode,
  setViewMode,
  handleGradeChange,
  handlePlayerUpdate,
  handleBulkPlayerUpdate,
  handleAddPlayer,
  handleDeletePlayer,
  
  // Activity data
  filteredActivities,
  filteredHistoricalActivities,
  selectedActivity,
  setSelectedActivity,
  editingActivity,
  setEditingActivity,
  isAddActivityOpen,
  setIsAddActivityOpen,
  selectedActivityTypes,
  handleActivityTypeChange,
  handleActivityUpdate,
  handleKioskUpdate,
  handleDelete,
  handleImportActivities,
  handleClearHistorical,
  handleAddActivity,
  onPlayerActivitySelect,
  handleMatchResultUpdate,
  onPlayerSelect
}: PlayersPageContentProps) {
  
  
  const gradeData = players.reduce((acc, player) => {
    if (player.positions?.includes("TRÄNARE")) return acc;
    
    const grade = player.grade;
    const existingGrade = acc.find(item => item.grade === grade);
    
    if (existingGrade) {
      existingGrade.players++;
    } else if (grade) {
      acc.push({ grade, players: 1 });
    }
    
    return acc;
  }, [] as { grade: string, players: number }[]);
  
  gradeData.sort((a, b) => a.grade.localeCompare(b.grade));

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="players">Spelare</TabsTrigger>
          <TabsTrigger value="activities">Aktiviteter</TabsTrigger>
          <TabsTrigger value="statistics">Statistik</TabsTrigger>
        </TabsList>
        
        <TabsContent value="players">
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
              onActivitySelect={onPlayerActivitySelect}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                  <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Sök spelare..."
                  />
                  <PlayerFilter
                    selectedGrades={selectedGrades}
                    onGradeChange={handleGradeChange}
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button onClick={() => setIsAddPlayerOpen(true)} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Lägg till spelare
                  </Button>
                </div>
              </div>
              
              <PlayerList
                players={filteredPlayers}
                activities={activities}
                viewMode={viewMode as "grid" | "list"}
                onPlayerSelect={setSelectedPlayer}
                onPlayerEdit={setEditingPlayer}
              />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="activities">
          <ActivityTabContent
            activities={activities}
            players={players}
            selectedActivity={selectedActivity}
            selectedActivityTypes={selectedActivityTypes}
            filteredActivities={filteredActivities}
            filteredHistoricalActivities={filteredHistoricalActivities}
            isAddActivityOpen={isAddActivityOpen}
            handleActivityTypeChange={handleActivityTypeChange}
            setSelectedActivity={setSelectedActivity}
            handleActivityUpdate={handleActivityUpdate}
            setIsAddActivityOpen={setIsAddActivityOpen}
            setEditingActivity={setEditingActivity}
            handleKioskAssignmentUpdate={handleKioskUpdate}
            handleDeleteActivity={handleDelete}
            handleImportedActivities={handleImportActivities}
            handleClearHistoricalActivities={handleClearHistorical}
            handleMatchResultUpdate={handleMatchResultUpdate}
            onPlayerSelect={onPlayerSelect}
          />
        </TabsContent>
        
        <TabsContent value="statistics">
          <StatisticsTabsWrapper 
            players={players}
            activities={activities}
            gradeData={gradeData}
            onActivitySelect={onPlayerActivitySelect}
            onPlayerSelect={onPlayerSelect}
          />
        </TabsContent>
      </Tabs>
      
      <AddPlayerDialog
        open={isAddPlayerOpen}
        onOpenChange={setIsAddPlayerOpen}
        onAddPlayer={handleAddPlayer}
      />
      
      {editingPlayer && (
        <EditPlayerDialog
          player={editingPlayer}
          open={!!editingPlayer}
          onOpenChange={(open) => !open && setEditingPlayer(null)}
          onPlayerUpdate={handlePlayerUpdate}
        />
      )}
    </div>
  );
}
