
import { useState } from "react";
import { Activity, Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { ActivityTabHeader } from "./activity-tab/components/ActivityTabHeader";
import { ActivityTabSearch } from "./activity-tab/components/ActivityTabSearch";
import { ActivityTabViewContent } from "./activity-tab/components/ActivityTabViewContent";
import { PullToRefresh } from "@/components/pull-to-refresh/PullToRefresh";
import { useActivityTabViews } from "./activity-tab/hooks/useActivityTabViews";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImportFromLiveForm } from "@/components/activity-management/tools/ImportFromLiveForm";
import { Globe } from "lucide-react";

interface ActivityTabContentProps {
  activities: Activity[];
  players: Player[];
  selectedActivity: Activity | null;
  selectedActivityTypes: string[];
  filteredActivities: Activity[];
  filteredHistoricalActivities: Activity[];
  isAddActivityOpen: boolean;
  isLoading?: boolean;
  loadError?: string | null;
  retryLoading?: () => void;
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

export function ActivityTabContent(props: ActivityTabContentProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  // Use the custom hook for managing views and selections
  const {
    activeView, 
    handleViewChange,
    selectedPlayer,
    handlePlayerSelect,
    renderContent,
    isHistorical,
    filteredBySearchActivities
  } = useActivityTabViews({
    activities: props.activities,
    players: props.players,
    selectedActivity: props.selectedActivity,
    setSelectedActivity: props.setSelectedActivity,
    searchQuery,
    filteredActivities: props.filteredActivities,
    filteredHistoricalActivities: props.filteredHistoricalActivities,
    setEditingActivity: props.setEditingActivity,
    handleDeleteActivity: props.handleDeleteActivity,
    handleActivityUpdate: props.handleActivityUpdate,
    handleKioskAssignmentUpdate: props.handleKioskAssignmentUpdate,
    handleMatchResultUpdate: props.handleMatchResultUpdate
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      if (props.retryLoading) {
        await props.retryLoading();
        toast.success("Data uppdaterad från servern");
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success("Data uppdaterad");
      }
    } catch (error) {
      toast.error("Kunde inte uppdatera data");
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleOpenImportDialog = () => {
    setIsImportDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <ActivityTabHeader 
          activeView={activeView}
          handleViewChange={handleViewChange}
          setIsAddActivityOpen={props.setIsAddActivityOpen}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          isMobile={isMobile}
          onImportClick={activeView === "tools" ? handleOpenImportDialog : undefined}
        />
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button onClick={() => props.setIsAddActivityOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Lägg till
          </Button>
        </div>
      </div>
      
      {activeView !== "statistics" && !props.isLoading && !props.loadError && (
        <ActivityTabSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isHistorical={isHistorical}
        />
      )}
      
      <PullToRefresh onRefresh={handleRefresh} disabled={!!props.selectedActivity || !!selectedPlayer || props.isLoading}>
        <ActivityTabViewContent
          activeView={activeView}
          renderContent={renderContent}
          players={props.players}
          activities={props.activities}
          isLoading={props.isLoading}
          loadError={props.loadError}
          retryLoading={props.retryLoading}
          onActivitySelect={props.setSelectedActivity}
          onPlayerSelect={handlePlayerSelect}
          onEditActivity={props.setEditingActivity}
          onActivityUpdate={props.handleActivityUpdate}
          onDeleteActivity={props.handleDeleteActivity}
          onKioskAssignmentUpdate={props.handleKioskAssignmentUpdate}
          onMatchResultUpdate={props.handleMatchResultUpdate}
        />
      </PullToRefresh>
      
      {/* Import from Live Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Importera från live-miljö
            </DialogTitle>
          </DialogHeader>
          <ImportFromLiveForm 
            onImportedActivities={async (activities) => {
              const result = await props.handleImportedActivities(activities);
              if (result) {
                setIsImportDialogOpen(false);
              }
              return result;
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
