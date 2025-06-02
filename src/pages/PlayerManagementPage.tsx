
import { PageContainer } from "@/components/page-containers/PageContainer";
import { usePlayers } from "@/hooks/players/usePlayers";
import { PlayersTabContent } from "@/components/player-management/PlayersTabContent";

export default function PlayerManagementPage() {
  const {
    // Player data
    players,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedGrades,
    selectedPositions,
    selectedPlayer,
    setSelectedPlayer,
    editingPlayer,
    setEditingPlayer,
    isAddPlayerOpen,
    setIsAddPlayerOpen,
    viewMode,
    setViewMode,
    filteredPlayers,
    handleGradeChange,
    handlePositionChange,
    handlePlayerUpdate,
    handleBulkPlayerUpdate,
    handleAddPlayer,
    handleDeletePlayer,
    isMobile
  } = usePlayers();

  // Calculate active filters count
  const activeFiltersCount = selectedGrades.length + selectedPositions.length;

  // Converting Promise<boolean> to Promise<void> for player update functions
  const handlePlayerUpdateWrapper = async (player: any) => {
    await handlePlayerUpdate(player);
  };
  
  const handleBulkPlayerUpdateWrapper = async (players: any[]) => {
    await handleBulkPlayerUpdate(players);
  };
  
  const handleAddPlayerWrapper = async (player: any) => {
    await handleAddPlayer(player);
  };

  const handleDeletePlayerWrapper = async (playerId: string) => {
    await handleDeletePlayer(playerId);
  };

  // Ensure viewMode is compatible with PlayersTabContent expectations
  const compatibleViewMode: "grid" | "list" = viewMode === "stats" ? "list" : viewMode as "grid" | "list";

  return (
    <PageContainer isLoading={isLoading}>
      <PlayersTabContent 
        players={players}
        activities={[]} // No activities needed for this simplified view
        searchQuery={searchQuery}
        selectedGrades={selectedGrades}
        selectedPositions={selectedPositions}
        activeFiltersCount={activeFiltersCount}
        selectedPlayer={selectedPlayer}
        viewMode={compatibleViewMode}
        filteredPlayers={filteredPlayers}
        onSearchChange={setSearchQuery}
        onGradeChange={handleGradeChange}
        onPositionChange={handlePositionChange}
        onPlayerSelect={setSelectedPlayer}
        onPlayerUpdate={handlePlayerUpdateWrapper}
        onAddPlayerClick={() => setIsAddPlayerOpen(true)}
        onEditPlayerClick={setEditingPlayer}
        isMobile={isMobile.isMobile}
      />
    </PageContainer>
  );
}
