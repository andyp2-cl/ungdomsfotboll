
import { useState } from "react";
import { Activity, Player } from "@/types/player";
import { ViewSelector } from "./ViewSelector";
import { AddActivityButton } from "./AddActivityButton";
import { ContentContainer } from "./ContentContainer";
import { ActivitySearch } from "@/components/activity-list/ActivitySearch";

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
  // Default to historical view for matches
  const [activeView, setActiveView] = useState<"upcoming" | "historical" | "statistics">("historical");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handlePlayerSelect = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      setSelectedPlayer(player);
      setSelectedActivity(null);
    }
  };

  // Modified to close any open detail when changing views
  const handleViewChange = (value: "upcoming" | "historical" | "statistics") => {
    if (value) {
      setActiveView(value);
      // Close any open details when changing views
      setSelectedActivity(null);
      setSelectedPlayer(null);
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

  // Filter activities based on search query for both historical and upcoming
  const displayedActivities = isHistorical 
    ? filteredHistoricalActivities
    : filteredActivities;
  
  const filteredBySearchActivities = displayedActivities.filter(activity => 
    searchQuery 
      ? activity.name.toLowerCase().includes(searchQuery.toLowerCase()) 
      : true
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <ViewSelector 
          activeView={activeView} 
          onViewChange={handleViewChange} 
        />
        <AddActivityButton onClick={() => setIsAddActivityOpen(true)} />
      </div>
      
      {activeView !== "statistics" && (
        <ActivitySearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder={`Sök matcher...`}
        />
      )}
      
      <ContentContainer
        activeView={activeView}
        selectedPlayer={selectedPlayer}
        selectedActivity={selectedActivity}
        activities={activities}
        players={players}
        filteredActivities={filteredBySearchActivities}
        searchQuery={searchQuery}
        isHistorical={isHistorical}
        gradeData={gradeData}
        relatedActivities={relatedActivities}
        cupMatches={cupMatches}
        onPlayerSelect={handlePlayerSelect}
        onActivitySelect={setSelectedActivity}
        onPlayerUpdate={dummyPlayerUpdate}
        onActivityUpdate={handleActivityUpdate}
        onEditActivity={setEditingActivity}
        onDeleteActivity={handleDeleteActivity}
        onKioskAssignmentUpdate={handleKioskAssignmentUpdate}
        onClosePlayerDetail={() => setSelectedPlayer(null)}
        onMatchResultUpdate={handleMatchResultUpdate}
      />
    </div>
  );
}
