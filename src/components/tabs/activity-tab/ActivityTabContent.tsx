
import { useState } from "react";
import { Activity, Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Plus, Save, Download, RefreshCw } from "lucide-react";
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
import { supabase } from "@/lib/supabase/client";
import { fetchPlayerActivities } from "@/lib/supabase/playerActivities";

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
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState<{
    activitiesCount: number;
    playersCount: number;
    playerActivitiesCount: number;
    connectionStatus: string;
  } | null>(null);
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
    
    // Clear existing caches to force fresh data
    localStorage.removeItem('cachedActivities');
    localStorage.removeItem('cachedActivityPlayers');
    localStorage.removeItem('cachedPlayerActivities');
    localStorage.removeItem('sb-activities-fetch-time');
    localStorage.removeItem('playerActivitiesFetchTime');
    
    try {
      if (props.retryLoading) {
        // Force refresh from database
        await props.retryLoading();
        console.log("Forcing data refresh from server");
        toast.success("Data uppdaterad från servern");
        
        // Fetch diagnostic information
        await runDiagnostics();
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

  const runDiagnostics = async () => {
    setShowDiagnostics(true);
    
    try {
      // Check database connection
      let connectionStatus = "Kontrollerar...";
      try {
        const { count } = await supabase
          .from('activities')
          .select('*', { count: 'exact', head: true });
        
        connectionStatus = "Ansluten ✓";
      } catch (error) {
        connectionStatus = "Ej ansluten ✗";
      }
      
      // Get counts directly from database
      let activitiesCount = 0;
      let playersCount = 0;
      let playerActivitiesCount = 0;
      
      try {
        const { count: actCount } = await supabase
          .from('activities')
          .select('*', { count: 'exact', head: true });
        activitiesCount = actCount || 0;
      } catch (e) {
        console.error("Error counting activities:", e);
      }
      
      try {
        const { count: plrCount } = await supabase
          .from('players')
          .select('*', { count: 'exact', head: true });
        playersCount = plrCount || 0;
      } catch (e) {
        console.error("Error counting players:", e);
      }
      
      try {
        const { count: paCount } = await supabase
          .from('player_activities')
          .select('*', { count: 'exact', head: true });
        playerActivitiesCount = paCount || 0;
      } catch (e) {
        console.error("Error counting player_activities:", e);
      }
      
      setDiagnosticData({
        activitiesCount,
        playersCount,
        playerActivitiesCount,
        connectionStatus
      });
      
    } catch (error) {
      console.error("Error running diagnostics:", error);
      toast.error("Kunde inte köra diagnostik");
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
          
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? "Uppdaterar..." : "Uppdatera data"}
          </Button>
        </div>
      </div>
      
      {showDiagnostics && diagnosticData && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <h3 className="text-sm font-medium mb-2">Diagnostisk information:</h3>
          <div className="text-xs space-y-1">
            <p>Databasanslutning: <span className="font-mono">{diagnosticData.connectionStatus}</span></p>
            <p>Antal aktiviteter i databasen: <span className="font-mono">{diagnosticData.activitiesCount}</span></p>
            <p>Antal spelare i databasen: <span className="font-mono">{diagnosticData.playersCount}</span></p>
            <p>Antal spelaraktivitetsrelationer: <span className="font-mono">{diagnosticData.playerActivitiesCount}</span></p>
            <p>Visar: <span className="font-mono">{props.activities.length} aktiviteter</span></p>
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline" onClick={() => setShowDiagnostics(false)}>
                Stäng
              </Button>
              <Button size="sm" variant="outline" onClick={runDiagnostics}>
                Uppdatera diagnostik
              </Button>
            </div>
          </div>
        </div>
      )}
      
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
            <li>Klicka på "Uppdatera data" för att försöka ladda datan igen</li>
            <li>
              <button 
                onClick={runDiagnostics} 
                className="text-blue-600 underline hover:text-blue-800 flex items-center gap-1"
              >
                Kontrollera anslutning och visa diagnostisk information
              </button>
            </li>
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
