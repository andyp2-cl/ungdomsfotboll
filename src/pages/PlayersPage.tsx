import { PageContainer } from "@/components/page-containers/PageContainer";
import { PlayersPageContent } from "@/components/player-page/PlayersPageContent";
import { usePlayersPageState } from "@/components/player-page/usePlayersPageState";

interface PlayersPageProps {
  initialTab?: string;
}

export default function PlayersPage({ initialTab }: PlayersPageProps = {}) {
  const state = usePlayersPageState(initialTab);

  return (
    <PageContainer isLoading={state.isLoading}>
      <PlayersPageContent
        activeTab={state.activeTab}
        setActiveTab={state.setActiveTab}
        
        players={state.players}
        activities={state.activities}
        searchQuery={state.searchQuery}
        selectedGrades={state.selectedGrades}
        selectedPlayer={state.selectedPlayer}
        viewMode={state.viewMode}
        filteredPlayers={state.filteredPlayers}
        
        selectedActivityTypes={state.selectedActivityTypes}
        selectedActivity={state.selectedActivity}
        filteredActivities={state.filteredActivities}
        filteredHistoricalActivities={state.filteredHistoricalActivities}
        
        isAddPlayerOpen={state.isAddPlayerOpen}
        isAddActivityOpen={state.isAddActivityOpen}
        editingPlayer={state.editingPlayer}
        editingActivity={state.editingActivity}
        
        isLoading={state.isLoading}
        canEdit={state.canEdit}
        
        setSearchQuery={state.setSearchQuery}
        handleGradeChange={state.handleGradeChange}
        setSelectedPlayer={state.setSelectedPlayer}
        setViewMode={state.setViewMode}
        handlePlayerUpdate={state.handlePlayerUpdate}
        handleBulkPlayerUpdate={state.handleBulkPlayerUpdate}
        setIsAddPlayerOpen={state.setIsAddPlayerOpen}
        setEditingPlayer={state.setEditingPlayer}
        
        handleActivityTypeChange={state.handleActivityTypeChange}
        setSelectedActivity={state.setSelectedActivity}
        handleActivityUpdate={state.handleActivityUpdate}
        setIsAddActivityOpen={state.setIsAddActivityOpen}
        setEditingActivity={state.setEditingActivity}
        handleKioskUpdate={state.handleKioskUpdate}
        handleDelete={state.handleDelete}
        handleImportActivities={state.handleImportActivities}
        handleScraped={state.handleScraped}
        handleClearHistorical={state.handleClearHistorical}
        
        handlePlayerActivitySelect={state.handlePlayerActivitySelect}
        handleAddPlayer={state.handleAddPlayer}
        handleAddActivity={state.handleAddActivity}
      />
    </PageContainer>
  );
}
