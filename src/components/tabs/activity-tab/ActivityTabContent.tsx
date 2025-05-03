
import { useState } from "react";
import { Activity, Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Plus, Save, Download } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ActivityTabHeader } from "./components/ActivityTabHeader";
import { ActivityTabSearch } from "./components/ActivityTabSearch";
import { ActivityTabViewContent } from "./components/ActivityTabViewContent";
import { PullToRefresh } from "@/components/pull-to-refresh/PullToRefresh";
import { useActivityTabViews } from "./hooks/useActivityTabViews";
import { useBackupRestore } from "@/utils/storage/backup";
import { BackupRestoreDialog } from "@/components/backup-restore/BackupRestoreDialog";
import { downloadCSVTemplate, downloadExportInstructions } from "@/components/file-import/helpers/downloadHelpers";

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
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false);
  const [backupMode, setBackupMode] = useState<"backup" | "restore">("backup");
  const isMobile = useIsMobile();
  const { createBackup, getLastBackupInfo } = useBackupRestore();

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
        // Force refresh from database
        await props.retryLoading();
        console.log("Forcing data refresh from server");
        toast.success("Data uppdaterad från servern");
      } else {
        // Fallback if retryLoading is not available
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success("Data uppdaterad");
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Kunde inte uppdatera data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleOpenBackupDialog = () => {
    setBackupMode("backup");
    setIsBackupDialogOpen(true);
  };

  const handleOpenRestoreDialog = () => {
    setBackupMode("restore");
    setIsBackupDialogOpen(true);
  };

  const handleQuickBackup = async () => {
    try {
      await createBackup();
      toast.success("Säkerhetskopia skapad");
    } catch (error) {
      console.error("Error creating backup:", error);
      toast.error("Kunde inte skapa säkerhetskopia");
    }
  };

  const handleDownloadCSVTemplate = () => {
    downloadCSVTemplate();
    toast.success("CSV-mall nedladdad");
  };

  const handleDownloadExportInstructions = () => {
    downloadExportInstructions();
    toast.success("Exportinstruktioner nedladdade");
  };

  // Display debug information about data loading state
  console.log("ActivityTabContent rendering with:", {
    activitiesCount: props.activities.length,
    filteredActivitiesCount: props.filteredActivities.length,
    filteredHistoricalActivitiesCount: props.filteredHistoricalActivities.length,
    isLoading: props.isLoading,
    loadError: props.loadError
  });

  // Add debug section if there's no data but we're not in loading state
  const hasNoData = props.activities.length === 0 && !props.isLoading;

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
          onBackupClick={handleOpenBackupDialog}
          onRestoreClick={handleOpenRestoreDialog}
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
      
      {hasNoData && (
        <div className="p-4 border rounded-md bg-amber-50 space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <span className="text-amber-600">Inga aktiviteter hittades</span>
          </h3>
          <p>Du kan:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Klicka på "Uppdatera" för att försöka ladda datan igen</li>
            <li>Importera aktiviteter från CSV genom att gå till "Verktyg"</li>
            <li>
              <button 
                onClick={handleDownloadCSVTemplate} 
                className="text-blue-600 underline hover:text-blue-800 flex items-center gap-1"
              >
                <Download className="h-3 w-3" />
                Ladda ner CSV-mall
              </button>
            </li>
            <li>
              <button 
                onClick={handleDownloadExportInstructions} 
                className="text-blue-600 underline hover:text-blue-800 flex items-center gap-1"
              >
                <Download className="h-3 w-3" />
                Ladda ner exportinstruktioner
              </button>
            </li>
          </ul>
        </div>
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
          onImportActivities={props.handleImportedActivities}
        />
      </PullToRefresh>

      {/* Backup/Restore Dialog */}
      <BackupRestoreDialog 
        isOpen={isBackupDialogOpen} 
        onOpenChange={setIsBackupDialogOpen}
        defaultTab={backupMode}
      />
    </div>
  );
}
