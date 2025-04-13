
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
  handleActivityUpdate: (activity: Activity) => void;
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
  const [activeView, setActiveView] = useState<"upcoming" | "historical" | "statistics">("historical");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useIsMobile();

  const handlePlayerSelect = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      setSelectedPlayer(player);
      setSelectedActivity(null);
    }
  };

  // Modified to properly handle view changes and ensure statistics tab works
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
      return (
        <PlayerDetail 
          player={selectedPlayer} 
          activities={activities} 
          onClose={() => setSelectedPlayer(null)}
          onEdit={(player) => console.log("Edit player not implemented in this context", player)}
          onPlayerUpdate={(player) => console.log("Player update not implemented in this context", player)}
          allPlayers={players}
        />
      );
    }
    
    if (selectedActivity) {
      return (
        <ActivityDetail 
          activity={selectedActivity}
          players={players}
          onBack={() => setSelectedActivity(null)}
          onEdit={setEditingActivity}
          onDeleteActivity={handleDeleteActivity}
          onActivityUpdate={handleActivityUpdate}
          onKioskAssignmentUpdate={handleKioskAssignmentUpdate}
          onActivitySelect={setSelectedActivity}
          relatedActivities={activities.filter(a => 
            a.cupId === selectedActivity.cupId && a.id !== selectedActivity.id
          )}
          cupMatches={selectedActivity.type === 'cup' 
            ? activities.filter(a => a.cupId === selectedActivity.id)
            : []}
          allActivities={activities}
          onClose={() => setSelectedActivity(null)}
          onMatchResultUpdate={handleMatchResultUpdate}
          onPlayerSelect={handlePlayerSelect}
        />
      );
    }
    
    if (activeView === "statistics") {
      return (
        <StatisticsTabsWrapper 
          players={players}
          activities={activities}
          gradeData={players.reduce((acc, player) => {
            if (player.positions?.includes("TRÄNARE")) return acc;
            
            const grade = player.grade;
            const existingGrade = acc.find(item => item.grade === grade);
            
            if (existingGrade) {
              existingGrade.players++;
            } else {
              acc.push({ grade, players: 1 });
            }
            
            return acc;
          }, [] as { grade: string, players: number }[]).sort((a, b) => a.grade.localeCompare(b.grade))}
        />
      );
    }
    
    return (
      <ActivityList 
        activities={filteredBySearchActivities}
        players={players}
        onSelect={setSelectedActivity}
        onPlayerSelect={handlePlayerSelect}
        isHistorical={isHistorical}
        isMobile={isMobile}
        noResultsMessage={searchQuery ? `Inga matcher hittades för "${searchQuery}"` : "Inga aktiviteter hittades"}
      />
    );
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
        {renderContent()}
      </PullToRefresh>
    </div>
  );
}
