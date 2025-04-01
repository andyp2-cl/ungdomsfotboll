
import { useState, useEffect } from "react";
import { usePlayers } from "@/hooks/players/usePlayers";
import { useActivities } from "@/hooks/activities/useActivities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayersTabContent } from "@/components/player-management/PlayersTabContent";
import { ActivitiesTabContent } from "@/components/player-management/ActivitiesTabContent";
import { AnalyticsTabContent } from "@/components/player-management/AnalyticsTabContent";
import { StatisticsTabContent } from "@/components/player-management/StatisticsTabContent";
import { AddPlayerForm } from "@/components/AddPlayerForm";
import { EditActivityForm } from "@/components/EditActivityForm";

export default function PlayerManagementPage() {
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  
  // Player state and actions
  const { players, isLoading: playersLoading, setPlayers, handlePlayerUpdate } = usePlayers();
  
  // Activity state and actions
  const {
    // State
    activities,
    isLoading: activitiesLoading,
    selectedActivity,
    setSelectedActivity,
    editingActivity,
    setEditingActivity,
    isAddActivityOpen,
    setIsAddActivityOpen,
    
    // Filters
    selectedActivityTypes,
    filteredActivities,
    filteredHistoricalActivities,
    handleActivityTypeChange,
    
    // Actions
    handleActivityUpdate,
    handleDeleteActivity,
    handleKioskAssignmentUpdate,
    handleAddActivity,
    handleImportedActivities,
    handleScrapedMatches,
    handleClearHistoricalActivities
  } = useActivities(players, setPlayers);
  
  // Compute counts for player grades
  const gradeData = players.reduce((acc, player) => {
    if (player.positions?.includes("TRÄNARE")) return acc;
    
    const grade = player.grade;
    const existingGrade = acc.find(item => item.grade === grade);
    
    if (existingGrade) {
      existingGrade.players++;
    } else {
      acc.push({ grade, players: 1 });
    }
    
    return acc;
  }, [] as { grade: string, players: number }[]);
  
  // Sort grades (A, B, C, D)
  gradeData.sort((a, b) => a.grade.localeCompare(b.grade));
  
  // Check if data is loading
  const isLoading = playersLoading || activitiesLoading;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Spelarhallning</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-xl text-muted-foreground">Laddar data...</p>
        </div>
      ) : (
        <Tabs defaultValue="players">
          <TabsList className="mb-6">
            <TabsTrigger value="players">Spelare</TabsTrigger>
            <TabsTrigger value="activities">Aktiviteter</TabsTrigger>
            <TabsTrigger value="analytics">Analys</TabsTrigger>
            <TabsTrigger value="statistics">Statistik</TabsTrigger>
          </TabsList>
          
          <TabsContent value="players" className="space-y-4">
            <PlayersTabContent 
              players={players}
              activities={activities}
              searchQuery=""
              selectedGrades={[]}
              selectedPositions={[]}
              activeFiltersCount={0}
              selectedPlayer={null}
              viewMode="list"
              filteredPlayers={players}
              onSearchChange={() => {}}
              onGradeChange={() => {}}
              onPositionChange={() => {}}
              onPlayerSelect={() => {}}
              onPlayerUpdate={handlePlayerUpdate}
              onAddPlayerClick={() => setIsAddPlayerOpen(true)}
              onEditPlayerClick={() => {}}
              isMobile={false}
            />
          </TabsContent>
          
          <TabsContent value="activities">
            <ActivitiesTabContent
              activities={filteredActivities}
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
              handleKioskAssignmentUpdate={handleKioskAssignmentUpdate}
              handleDeleteActivity={handleDeleteActivity}
              handleImportedActivities={handleImportedActivities}
              handleScrapedMatches={handleScrapedMatches}
              handleClearHistoricalActivities={handleClearHistoricalActivities}
            />
          </TabsContent>
          
          <TabsContent value="analytics">
            <AnalyticsTabContent 
              players={players}
              activities={filteredActivities}
              gradeData={gradeData}
            />
          </TabsContent>
          
          <TabsContent value="statistics">
            <StatisticsTabContent 
              players={players}
              activities={filteredActivities}
              gradeData={gradeData}
            />
          </TabsContent>
        </Tabs>
      )}
      
      {isAddPlayerOpen && (
        <AddPlayerForm 
          onSave={() => setIsAddPlayerOpen(false)}
          onCancel={() => setIsAddPlayerOpen(false)}
        />
      )}
      
      {editingActivity && (
        <EditActivityForm
          activity={editingActivity}
          onSave={handleActivityUpdate}
          onCancel={() => setEditingActivity(null)}
        />
      )}
    </div>
  );
}
