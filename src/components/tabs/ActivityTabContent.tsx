import { useState, useCallback } from "react";
import { Activity, Player } from "@/types/player";
import { SearchInput } from "@/components/SearchInput";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BarChart3, Calendar, Clock, List, Plus, Trash2, Search } from "lucide-react";
import { ActivityList } from "@/components/ActivityList";
import { ActivityDetail } from "@/components/activity-detail";
import { PlayerDetail } from "@/components/PlayerDetail";
import { Button } from "@/components/ui/button";
import { StatisticsTabsWrapper } from "@/components/player-management/statistics/StatisticsTabsWrapper";
import { useIsMobile } from "@/hooks/use-mobile";
import { ActivitySearch } from "@/components/activity-list/ActivitySearch";
import { PullToRefresh } from "@/components/pull-to-refresh/PullToRefresh";
import { toast } from "sonner";
import { PlayerPreview } from "@/components/player-preview/PlayerPreview";
import { ActivityTabViewContent } from "@/components/tabs/activity-tab/components/ActivityTabViewContent";

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
  onPlayerSelect?: (playerId: string) => void;
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
  const [activeView, setActiveView] = useState<"upcoming" | "historical" | "statistics">("historical");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useIsMobile();

  const handlePlayerSelect = (playerId: string) => {
    console.log("ActivityTabContent: handlePlayerSelect called with playerId:", playerId);
    
    if (playerId === "") {
      console.log("ActivityTabContent: Clearing selected player");
      setSelectedPlayer(null);
    } else {
      const player = players.find(p => p.id === playerId);
      if (player) {
        console.log("ActivityTabContent: Found player:", player.name);
        setSelectedPlayer(player);
        // Clear activity selection when selecting a player
        setSelectedActivity(null);
      } else {
        console.log("ActivityTabContent: Player not found for id:", playerId);
      }
    }
    
    // Always call the parent onPlayerSelect to update global state
    if (onPlayerSelect) {
      console.log("ActivityTabContent: Calling parent onPlayerSelect");
      onPlayerSelect(playerId);
    }
  };

  const handleViewChange = (value: string) => {
    if (value === "upcoming" || value === "historical" || value === "statistics") {
      setActiveView(value as "upcoming" | "historical" | "statistics");
      setSelectedActivity(null);
      setSelectedPlayer(null);
    }
  };

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

  const dummyPlayerUpdate = (player: Player) => {
    console.log("Player update not implemented in this context", player);
  };

  const gradeData = players.reduce((acc, player) => {
    if (player.positions?.includes("TRÄNARE")) return acc;
    
    const grade = player.grade;
    const existingGrade = acc.find(item => item.grade === grade);
    
    if (existingGrade) {
      existingGrade.players++;
    } else {
      acc.push({ grade, players: 1 });
    }
    
    return acc;
  }, [] as { grade: string, players: number }[]);
  
  gradeData.sort((a, b) => a.grade.localeCompare(b.grade));

  const relatedActivities = selectedActivity?.cupId 
    ? activities.filter(a => a.cupId === selectedActivity.cupId && a.id !== selectedActivity.id)
    : [];

  const cupMatches = selectedActivity?.type === 'cup'
    ? activities.filter(a => a.cupId === selectedActivity.id)
    : [];

  const isHistorical = activeView === "historical";

  const filteredBySearchActivities = isHistorical 
    ? filteredHistoricalActivities.filter(activity => 
        searchQuery 
          ? activity.name.toLowerCase().includes(searchQuery.toLowerCase()) 
          : true)
    : filteredActivities.filter(activity => 
        searchQuery 
          ? activity.name.toLowerCase().includes(searchQuery.toLowerCase()) 
          : true);

  const renderContent = () => {
    if (selectedPlayer) {
      return {
        viewType: "player-detail",
        player: selectedPlayer
      };
    }
    
    if (selectedActivity) {
      return {
        viewType: "activity-detail",
        activity: selectedActivity,
        relatedActivities: relatedActivities,
        cupMatches: cupMatches
      };
    }
    
    if (activeView === "statistics") {
      return {
        viewType: "statistics"
      };
    }
    
    return {
      viewType: "activities-list",
      activities: filteredBySearchActivities,
      searchQuery: searchQuery
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className={`${isMobile ? 'w-full overflow-x-auto pb-2' : 'w-full sm:w-auto space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4'}`}>
          <ToggleGroup 
            type="single" 
            value={activeView} 
            onValueChange={handleViewChange} 
            className={`justify-start ${isMobile ? 'w-full flex' : ''}`}
          >
            <ToggleGroupItem value="upcoming" aria-label="Kommande aktiviteter" className={isMobile ? 'flex-1 py-1.5 px-2 text-xs' : ''}>
              <Calendar className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
              {isMobile ? 'Kommande' : 'Kommande'}
            </ToggleGroupItem>
            <ToggleGroupItem value="historical" aria-label="Historiska aktiviteter" className={isMobile ? 'flex-1 py-1.5 px-2 text-xs' : ''}>
              <Clock className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
              {isMobile ? 'Historik' : 'Historik'}
            </ToggleGroupItem>
            <ToggleGroupItem value="statistics" aria-label="Statistik" className={isMobile ? 'flex-1 py-1.5 px-2 text-xs' : ''}>
              <BarChart3 className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
              {isMobile ? 'Statistik' : 'Statistik'}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button onClick={() => setIsAddActivityOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Lägg till
          </Button>
        </div>
      </div>
      
      {activeView !== "statistics" && (
        <ActivitySearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder={`Sök ${isHistorical ? 'historiska ' : ''}matcher...`}
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
          onActivityUpdate={handleActivityUpdate}
          onDeleteActivity={handleDeleteActivity}
          onKioskAssignmentUpdate={handleKioskAssignmentUpdate}
          onMatchResultUpdate={handleMatchResultUpdate}
        />
      </PullToRefresh>
    </div>
  );
}
