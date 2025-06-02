
import { PageContainer } from "@/components/page-containers/PageContainer";
import { usePlayers } from "@/hooks/players/usePlayers";
import { PlayersTabContent } from "@/components/player-management/PlayersTabContent";
import { BackupRestoreActions } from "@/components/backup-restore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatabaseBackup } from "lucide-react";

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
      <div className="space-y-6">
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
          isMobile={isMobile}
        />
        
        {/* Backup/Restore section moved here from Index page */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <DatabaseBackup className="h-5 w-5" />
              Säkerhetskopiering
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Här kan du skapa en säkerhetskopia av alla spelare och aktiviteter, eller återställa från en tidigare skapad säkerhetskopia.
            </p>
            <BackupRestoreActions />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
