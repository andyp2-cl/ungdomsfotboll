
import { useState, useEffect } from "react";
import { PageContainer } from "@/components/page-containers/PageContainer";
import { PlayersPageContent } from "@/components/page-content/PlayersPageContent";
import { MainTabs } from "@/components/tabs/MainTabs";
import { usePlayers } from "@/hooks/players";
import { useActivities } from "@/hooks/activities";
import { useLocation } from "react-router-dom";

interface PlayersPageProps {
  initialTab?: string;
}

export default function PlayersPage({ initialTab = "players" }: PlayersPageProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const location = useLocation();
  const { state } = location;

  const playersHook = usePlayers();
  const activitiesHook = useActivities();

  // Handle activity selection from state (e.g., coming from leagues section)
  useEffect(() => {
    if (state?.selectedActivityId) {
      console.log("Received selectedActivityId in state:", state.selectedActivityId);
      const activity = activitiesHook.activities.find(a => a.id === state.selectedActivityId);
      
      if (activity) {
        console.log("Found activity to select:", activity.name);
        activitiesHook.setSelectedActivity(activity);
        
        // Set active tab if provided in state
        if (state.activeTab) {
          setActiveTab(state.activeTab);
        } else {
          setActiveTab("activities");
        }
      }
    }
  }, [state, activitiesHook.activities]);

  return (
    <PageContainer>
      <MainTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        playersContent={
          <PlayersPageContent
            players={playersHook.players}
            filteredPlayers={playersHook.filteredPlayers}
            selectedPlayerTypes={playersHook.selectedPlayerTypes}
            handlePlayerTypeChange={playersHook.handlePlayerTypeChange}
            isAddPlayerOpen={playersHook.isAddPlayerOpen}
            setIsAddPlayerOpen={playersHook.setIsAddPlayerOpen}
            selectedPlayer={playersHook.selectedPlayer}
            setSelectedPlayer={playersHook.setSelectedPlayer}
            handleAddPlayer={playersHook.handleAddPlayer}
            handleUpdatePlayer={playersHook.handleUpdatePlayer}
            handleDeletePlayer={playersHook.handleDeletePlayer}
            editingPlayer={playersHook.editingPlayer}
            setEditingPlayer={playersHook.setEditingPlayer}
          />
        }
        activitiesContent={
          <PlayersPageContent
            activities={activitiesHook.activities}
            filteredActivities={activitiesHook.filteredActivities}
            filteredHistoricalActivities={activitiesHook.filteredHistoricalActivities}
            selectedActivityTypes={activitiesHook.selectedActivityTypes}
            handleActivityTypeChange={activitiesHook.handleActivityTypeChange}
            isAddActivityOpen={activitiesHook.isAddActivityOpen}
            setIsAddActivityOpen={activitiesHook.setIsAddActivityOpen}
            selectedActivity={activitiesHook.selectedActivity}
            setSelectedActivity={activitiesHook.setSelectedActivity}
            handleAddActivity={activitiesHook.handleAddActivity}
            handleActivityUpdate={activitiesHook.handleActivityUpdate}
            handleDeleteActivity={activitiesHook.handleDeleteActivity}
            editingActivity={activitiesHook.editingActivity}
            setEditingActivity={activitiesHook.setEditingActivity}
            handleKioskAssignmentUpdate={activitiesHook.handleKioskAssignmentUpdate}
            handleImportedActivities={activitiesHook.handleImportedActivities}
            handleClearHistoricalActivities={activitiesHook.handleClearHistoricalActivities}
            handleMatchResultUpdate={activitiesHook.handleMatchResultUpdate}
            players={playersHook.players}
          />
        }
      />
    </PageContainer>
  );
}
