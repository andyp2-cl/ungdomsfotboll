
import { useState } from "react";
import { Activity, Player } from "@/types/player";
import { PullToRefresh } from "@/components/pull-to-refresh/PullToRefresh";
import { toast } from "sonner";
import { useActivityTabViews } from "./hooks/useActivityTabViews";
import { ActivityTabHeader } from "./components/ActivityTabHeader";
import { ActivityTabSearch } from "./components/ActivityTabSearch";
import { ActivityTabViewContent } from "./components/ActivityTabViewContent";

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
  
  // Wrap the activity update function to ensure Promise<void> return type
  const handleActivityUpdateWrapper = async (activity: Activity): Promise<void> => {
    await handleActivityUpdate(activity);
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Data uppdaterad");
    } catch (error) {
      toast.error("Kunde inte uppdatera data");
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
      />
      
      {activeView !== "statistics" && (
        <ActivityTabSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isHistorical={isHistorical}
        />
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
