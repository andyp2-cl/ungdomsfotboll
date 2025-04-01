
import { PageContainer } from "@/components/page-containers/PageContainer";
import { usePlayers } from "@/hooks/usePlayers";
import { PlayersPageContent } from "@/components/page-content/PlayersPageContent";
import { BackupRestoreActions } from "@/components/BackupRestoreActions";

interface PlayersPageProps {
  initialTab?: string;
}

export default function PlayersPage({ initialTab }: PlayersPageProps = {}) {
  const {
    // Tab state
    activeTab,
    setActiveTab,
    
    // Player data
    players,
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
    
    // Activity data
    activities,
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
    handleScraped,
    handleClearHistorical,
    handleAddActivity,
    handlePlayerActivitySelect,
    
    // Loading state
    isLoading
  } = usePlayers(initialTab);

  return (
    <PageContainer isLoading={isLoading}>
      <PlayersPageContent 
        // Tab state
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        
        // Player data
        players={players}
        activities={activities}
        filteredPlayers={filteredPlayers}
        selectedPlayer={selectedPlayer}
        setSelectedPlayer={setSelectedPlayer}
        editingPlayer={editingPlayer}
        setEditingPlayer={setEditingPlayer}
        isAddPlayerOpen={isAddPlayerOpen}
        setIsAddPlayerOpen={setIsAddPlayerOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedGrades={selectedGrades}
        viewMode={viewMode}
        setViewMode={setViewMode}
        handleGradeChange={handleGradeChange}
        handlePlayerUpdate={handlePlayerUpdate}
        handleBulkPlayerUpdate={handleBulkPlayerUpdate}
        handleAddPlayer={handleAddPlayer}
        
        // Activity data
        filteredActivities={filteredActivities}
        filteredHistoricalActivities={filteredHistoricalActivities}
        selectedActivity={selectedActivity}
        setSelectedActivity={setSelectedActivity}
        editingActivity={editingActivity}
        setEditingActivity={setEditingActivity}
        isAddActivityOpen={isAddActivityOpen}
        setIsAddActivityOpen={setIsAddActivityOpen}
        selectedActivityTypes={selectedActivityTypes}
        handleActivityTypeChange={handleActivityTypeChange}
        handleActivityUpdate={handleActivityUpdate}
        handleKioskUpdate={handleKioskUpdate}
        handleDelete={handleDelete}
        handleImportActivities={handleImportActivities}
        handleScraped={handleScraped}
        handleClearHistorical={handleClearHistorical}
        handleAddActivity={handleAddActivity}
        onPlayerActivitySelect={handlePlayerActivitySelect}
      />
      
      {/* Backup/Restore actions at the bottom of the page */}
      <div className="fixed bottom-4 right-4 z-10">
        <BackupRestoreActions />
      </div>
    </PageContainer>
  );
}
