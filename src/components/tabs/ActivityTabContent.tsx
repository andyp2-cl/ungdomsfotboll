
import { useState, useCallback } from "react";
import { Activity, ActivityType, Player } from "@/types/player";
import { SearchInput } from "@/components/SearchInput";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BarChart3, Calendar, Clock, List, Plus, Trash2 } from "lucide-react";
import { ActivityList } from "@/components/ActivityList";
import { ActivityDetail } from "@/components/activity-detail/ActivityDetail";
import { PlayerDetail } from "@/components/PlayerDetail";
import { Button } from "@/components/ui/button";
import { StatisticsTabsWrapper } from "@/components/player-management/statistics/StatisticsTabsWrapper";

interface ActivityTabContentProps {
  activities: Activity[];
  players: Player[];
  selectedActivity: Activity | null;
  selectedActivityTypes: ActivityType[];
  filteredActivities: Activity[];
  filteredHistoricalActivities: Activity[];
  isAddActivityOpen: boolean;
  handleActivityTypeChange: (type: ActivityType) => void;
  setSelectedActivity: (activity: Activity | null) => void;
  handleActivityUpdate: (activity: Activity) => void;
  setIsAddActivityOpen: (isOpen: boolean) => void;
  setEditingActivity: (activity: Activity | null) => void;
  handleKioskAssignmentUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  handleDeleteActivity: (activityId: string) => Promise<boolean>;
  handleImportedActivities: (activities: Activity[]) => Promise<boolean>;
  handleScrapedMatches: (matches: Activity[]) => Promise<boolean>;
  handleClearHistoricalActivities: () => Promise<boolean>;
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
  handleScrapedMatches,
  handleClearHistoricalActivities
}: ActivityTabContentProps) {
  const [activeView, setActiveView] = useState<"upcoming" | "historical" | "statistics">("upcoming");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Function to view player from activity
  const handlePlayerSelect = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      setSelectedPlayer(player);
      setSelectedActivity(null);
    }
  };

  // Dummy no-op function for player updates in this context
  const dummyPlayerUpdate = (player: Player) => {
    console.log("Player update not implemented in this context", player);
  };

  // Räkna antalet spelare per årskurs (för statistik)
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
  
  // Sortera nivåer (A, B, C, D)
  gradeData.sort((a, b) => a.grade.localeCompare(b.grade));

  // Get related activities for the selected activity
  const relatedActivities = selectedActivity?.cupId 
    ? activities.filter(a => a.cupId === selectedActivity.cupId && a.id !== selectedActivity.id)
    : [];

  // Get cup matches if the selected activity is a cup
  const cupMatches = selectedActivity?.type === 'cup'
    ? activities.filter(a => a.cupId === selectedActivity.id)
    : [];

  // Determine if this is a historical activity (past date)
  const isHistorical = activeView === "historical";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
          <ToggleGroup type="single" value={activeView} onValueChange={(value) => {
            if (value) setActiveView(value as "upcoming" | "historical" | "statistics");
          }} className="justify-start">
            <ToggleGroupItem value="upcoming" aria-label="Kommande aktiviteter">
              <Calendar className="h-4 w-4 mr-2" />
              Kommande
            </ToggleGroupItem>
            <ToggleGroupItem value="historical" aria-label="Historiska aktiviteter">
              <Clock className="h-4 w-4 mr-2" />
              Historik
            </ToggleGroupItem>
            <ToggleGroupItem value="statistics" aria-label="Statistik">
              <BarChart3 className="h-4 w-4 mr-2" />
              Statistik
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setIsAddActivityOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Lägg till
          </Button>
        </div>
      </div>
      
      {selectedPlayer ? (
        <PlayerDetail 
          player={selectedPlayer} 
          activities={activities} 
          onClose={() => setSelectedPlayer(null)}
          onEdit={(player) => console.log("Edit player not implemented in this context", player)}
          onPlayerUpdate={dummyPlayerUpdate}
          allPlayers={players}
        />
      ) : selectedActivity ? (
        <ActivityDetail 
          activity={selectedActivity}
          players={players}
          onBack={() => setSelectedActivity(null)}
          onEdit={setEditingActivity}
          onDelete={handleDeleteActivity}
          onUpdate={handleActivityUpdate}
          onKioskUpdate={handleKioskAssignmentUpdate}
          onActivitySelect={setSelectedActivity}
          relatedActivities={relatedActivities}
          cupMatches={cupMatches}
          allActivities={activities}
          onClose={() => setSelectedActivity(null)}
        />
      ) : (
        <>
          {activeView === "statistics" ? (
            <StatisticsTabsWrapper 
              players={players}
              activities={activities}
              gradeData={gradeData}
            />
          ) : (
            <ActivityList 
              activities={activeView === "upcoming" ? filteredActivities : filteredHistoricalActivities}
              players={players}
              onSelect={setSelectedActivity}
              onPlayerSelect={handlePlayerSelect}
              isHistorical={isHistorical}
            />
          )}
        </>
      )}
    </div>
  );
}
