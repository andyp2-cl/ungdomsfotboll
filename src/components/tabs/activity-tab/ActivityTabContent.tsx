
import { useState, useEffect } from "react";
import { Activity, Player } from "@/types/player";
import { PullToRefresh } from "@/components/pull-to-refresh/PullToRefresh";
import { toast } from "sonner";
import { useActivityTabViews } from "./hooks/useActivityTabViews";
import { ActivityTabHeader } from "./components/ActivityTabHeader";
import { ActivityTabSearch } from "./components/ActivityTabSearch";
import { ActivityTabViewContent } from "./components/ActivityTabViewContent";
import { useIsMobile } from "@/hooks/use-mobile";

interface ActivityTabContentProps {
  activities: Activity[];
  players: Player[];
  selectedActivity: Activity | null;
  selectedActivityTypes: string[];
  filteredActivities: Activity[];
  filteredHistoricalActivities: Activity[];
  isAddActivityOpen: boolean;
  handleActivityTypeChange: (type: string) => void;
  setSelectedActivity: (activity: Activity | null) => void;
  handleActivityUpdate: (activity: Activity) => Promise<void>;
  setIsAddActivityOpen: (isOpen: boolean) => void;
  setEditingActivity: (activity: Activity | null) => void;
  handleKioskAssignmentUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  handleDeleteActivity: (activityId: string) => Promise<boolean>;
  handleImportedActivities: (activities: Activity[]) => Promise<boolean>;
  handleClearHistoricalActivities: () => Promise<boolean>;
  handleMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
}

export function ActivityTabContent({
  activities,
  players,
  selectedActivity,
  selectedActivityTypes,
  filteredActivities,
  filteredHistoricalActivities,
  isAddActivityOpen,
  handleActivityTypeChange,
  setSelectedActivity,
  handleActivityUpdate,
  setIsAddActivityOpen,
  setEditingActivity,
  handleKioskAssignmentUpdate,
  handleDeleteActivity,
  handleImportedActivities,
  handleClearHistoricalActivities,
  handleMatchResultUpdate
}: ActivityTabContentProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  // Wrap the activity update function with error handling to ensure Promise<void> return type
  const handleActivityUpdateWrapper = async (activity: Activity): Promise<void> => {
    setError(null);
    try {
      await handleActivityUpdate(activity);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ett okänt fel uppstod';
      console.error("Error updating activity:", err);
      setError(errorMessage);
      toast.error("Kunde inte uppdatera aktivitet", { description: errorMessage });
      throw err;
    }
  };
  
  const { 
    activeView,
    handleViewChange,
    selectedPlayer,
    setSelectedPlayer,
    handlePlayerSelect,
    renderContent,
    isHistorical,
    filteredBySearchActivities
  } = useActivityTabViews({
    activities,
    players,
    selectedActivity,
    setSelectedActivity,
    searchQuery,
    filteredActivities,
    filteredHistoricalActivities,
    setEditingActivity,
    handleDeleteActivity,
    handleActivityUpdate,
    handleKioskAssignmentUpdate,
    handleMatchResultUpdate
  });

  // Clear error state when switching activities or views
  useEffect(() => {
    setError(null);
  }, [selectedActivity, activeView]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Data uppdaterad");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ett okänt fel uppstod';
      setError(errorMessage);
      toast.error("Kunde inte uppdatera data", { description: errorMessage });
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      <ActivityTabHeader 
        activeView={activeView}
        handleViewChange={handleViewChange}
        setIsAddActivityOpen={setIsAddActivityOpen}
        isMobile={isMobile}
      />
      
      {activeView !== "statistics" && (
        <ActivityTabSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isHistorical={isHistorical}
        />
      )}
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <PullToRefresh onRefresh={handleRefresh} disabled={!!selectedActivity || !!selectedPlayer}>
        <ActivityTabViewContent 
          activeView={activeView}
          renderContent={renderContent}
          players={players}
          activities={activities}
          onActivitySelect={setSelectedActivity}
          onPlayerSelect={handlePlayerSelect}
          onEditActivity={setEditingActivity}
          onActivityUpdate={handleActivityUpdateWrapper}
          onDeleteActivity={handleDeleteActivity}
          onKioskAssignmentUpdate={handleKioskAssignmentUpdate}
          onMatchResultUpdate={handleMatchResultUpdate}
        />
      </PullToRefresh>
    </div>
  );
}
