import { useState } from "react";
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
  onPlayerSelect: (playerId: string) => void;
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
  handleMatchResultUpdate,
  onPlayerSelect
}: ActivityTabContentProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useIsMobile();
  
  // Pass onPlayerSelect directly to useActivityTabViews
  const { 
    activeView,
    handleViewChange,
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
    handleMatchResultUpdate,
    onPlayerSelect // Pass the external player selection handler
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

  // Add debug logging
  const handleActivitySelectWithLogging = (activity: Activity | null) => {
    console.log("ActivityTabContent: Activity selected:", activity?.id, activity?.name);
    setSelectedActivity(activity);
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
      
      <PullToRefresh onRefresh={handleRefresh} disabled={!!selectedActivity}>
        <ActivityTabViewContent 
          activeView={activeView}
          renderContent={renderContent}
          players={players}
          activities={activities}
          onActivitySelect={handleActivitySelectWithLogging}
          onPlayerSelect={onPlayerSelect} // Use the passed down onPlayerSelect here
          onEditActivity={setEditingActivity}
          onActivityUpdate={handleActivityUpdate}
          onDeleteActivity={handleDeleteActivity}
          onKioskAssignmentUpdate={handleKioskAssignmentUpdate}
          onMatchResultUpdate={handleMatchResultUpdate}
          previousView={activeView === "statistics" ? "historical" : undefined}
        />
      </PullToRefresh>
    </div>
  );
}
