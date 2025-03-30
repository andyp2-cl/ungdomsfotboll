
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PlayerHeader } from "@/components/PlayerHeader";
import { LoadingState } from "@/components/LoadingState";
import { PlayerManagement } from "@/components/PlayerManagement";
import { ActivityManagement } from "@/components/ActivityManagement";
import { DialogModals } from "@/components/DialogModals";
import { usePlayers } from "@/hooks/usePlayers";
import { useActivities } from "@/hooks/activities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { saveActiveTab, getActiveTab } from "@/utils/storage";
import { deleteAllHistoricalActivities } from "@/utils/storage/activityStorage";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface PlayersPageProps {
  initialTab?: string;
}

export default function PlayersPage({ initialTab }: PlayersPageProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const pathTab = location.pathname === "/activities" ? "activities" : "players";
  const storedTab = getActiveTab();
  const [activeTab, setActiveTab] = useState(pathTab || initialTab || storedTab);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Use custom hooks
  const {
    players,
    setPlayers,
    isLoading: isPlayersLoading,
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
    handleAddPlayer
  } = usePlayers();

  const {
    activities,
    isLoading: isActivitiesLoading,
    selectedActivityTypes,
    selectedActivity,
    setSelectedActivity,
    editingActivity,
    setEditingActivity,
    isAddActivityOpen,
    setIsAddActivityOpen,
    filteredActivities,
    filteredHistoricalActivities,
    handleActivityTypeChange,
    handleActivityUpdate,
    handleDeleteActivity,
    handleKioskAssignmentUpdate,
    handleAddActivity,
    handleImportedActivities,
    handleScrapedMatches,
    handleDeleteAllActivities,
    handleClearHistoricalActivities
  } = useActivities(players, setPlayers);

  useEffect(() => {
    saveActiveTab(activeTab);
    
    if (activeTab === "activities" && location.pathname !== "/activities") {
      navigate("/activities", { replace: true });
    } else if (activeTab === "players" && location.pathname !== "/players") {
      navigate("/players", { replace: true });
    }
  }, [activeTab, navigate, location.pathname]);

  const handleOneTimeDeleteHistoricalActivities = async () => {
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      
      await deleteAllHistoricalActivities();
      
      // Refresh activities after deletion
      window.location.reload();
      
      toast({
        title: "Permanent radering slutförd",
        description: "Alla historiska aktiviteter har raderats permanent från databasen.",
      });
    } catch (error) {
      console.error("Error deleting historical activities:", error);
      toast({
        title: "Fel vid radering",
        description: "Ett fel uppstod när historiska aktiviteter skulle raderas.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const isLoading = isPlayersLoading || isActivitiesLoading || isDeleting;

  if (isLoading) {
    return (
      <div className="container py-6">
        <PlayerHeader />
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="container py-6">
      <PlayerHeader />
      
      {location.pathname === "/activities" && (
        <div className="my-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="text-lg font-medium mb-2">Engångsåtgärd: Radera alla historiska aktiviteter</h3>
          <p className="mb-3">Denna åtgärd kommer att permanent ta bort alla aktiviteter från gårdagens datum och tidigare från databasen. Detta kan inte ångras.</p>
          <Button 
            variant="destructive"
            onClick={handleOneTimeDeleteHistoricalActivities}
            disabled={isDeleting}
            className="flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "Raderar..." : "Radera alla historiska aktiviteter permanent"}
          </Button>
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
          <TabsTrigger value="players">Spelare</TabsTrigger>
          <TabsTrigger value="activities">Aktiviteter</TabsTrigger>
        </TabsList>
        
        <TabsContent value="players" className="space-y-6">
          <PlayerManagement 
            players={players}
            activities={activities}
            searchQuery={searchQuery}
            selectedGrades={selectedGrades}
            selectedPlayer={selectedPlayer}
            viewMode="list" // Remove grid view option
            filteredPlayers={filteredPlayers}
            onSearchChange={setSearchQuery}
            onGradeChange={handleGradeChange}
            onPlayerSelect={setSelectedPlayer}
            onViewModeChange={setViewMode}
            onPlayerUpdate={handlePlayerUpdate}
            onBulkPlayerUpdate={handleBulkPlayerUpdate}
            onAddPlayerClick={() => setIsAddPlayerOpen(true)}
            onEditPlayerClick={setEditingPlayer}
          />
        </TabsContent>
        
        <TabsContent value="activities" className="space-y-6">
          <ActivityManagement 
            activities={activities}
            players={players}
            selectedActivity={selectedActivity}
            selectedActivityTypes={selectedActivityTypes}
            filteredActivities={filteredActivities}
            filteredHistoricalActivities={filteredHistoricalActivities}
            onActivityTypeChange={handleActivityTypeChange}
            onActivitySelect={setSelectedActivity}
            onActivityUpdate={handleActivityUpdate}
            onAddActivityClick={() => setIsAddActivityOpen(true)}
            onEditActivityClick={setEditingActivity}
            onKioskAssignmentUpdate={handleKioskAssignmentUpdate}
            onDeleteActivity={handleDeleteActivity}
            onImportedActivities={handleImportedActivities}
            onMatchesScraped={handleScrapedMatches}
            onDeleteAllActivities={handleDeleteAllActivities}
            onClearHistoricalActivities={handleClearHistoricalActivities}
          />
        </TabsContent>
      </Tabs>

      <DialogModals 
        editingPlayer={editingPlayer}
        editingActivity={editingActivity}
        isAddPlayerOpen={isAddPlayerOpen}
        isAddActivityOpen={isAddActivityOpen}
        onEditingPlayerChange={setEditingPlayer}
        onEditingActivityChange={setEditingActivity}
        onAddPlayerOpenChange={setIsAddPlayerOpen}
        onAddActivityOpenChange={setIsAddActivityOpen}
        onPlayerUpdate={handlePlayerUpdate}
        onActivityUpdate={handleActivityUpdate}
        onAddPlayer={handleAddPlayer}
        onAddActivity={handleAddActivity}
      />
    </div>
  );
}
