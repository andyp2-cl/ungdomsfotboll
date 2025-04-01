
import React, { useState, useEffect } from "react";
import { Activity, ActivityType, Player } from "@/types/player";
import { DatabaseLogs } from "@/components/DatabaseLogs";
import { TabsContent } from "@/components/ui/tabs";
import { ActivityTabContent, ToolsTabContent } from "@/components/activity-management";
import { ActivityManagementTabs } from "@/components/activity-management/ActivityManagementTabs";
import { HistoricalActivitiesContent } from "@/components/activity-management/HistoricalActivitiesContent";

interface ActivityManagementProps {
  activities: Activity[];
  players: Player[];
  selectedActivity: Activity | null;
  selectedActivityTypes: ActivityType[];
  filteredActivities: Activity[];
  filteredHistoricalActivities: Activity[];
  onActivityTypeChange: (type: ActivityType) => void;
  onActivitySelect: (activity: Activity | null) => void;
  onActivityUpdate: (activity: Activity) => void;
  onAddActivityClick: () => void;
  onEditActivityClick: (activity: Activity) => void;
  onKioskAssignmentUpdate: (activityId: string, playerId?: string) => void;
  onDeleteActivity?: (activityId: string) => void;
  onImportedActivities: (importedActivities: Activity[]) => void;
  onClearHistoricalActivities?: () => void;
}

export function ActivityManagement({
  activities,
  players,
  selectedActivity,
  selectedActivityTypes,
  filteredActivities,
  filteredHistoricalActivities,
  onActivityTypeChange,
  onActivitySelect,
  onActivityUpdate,
  onAddActivityClick,
  onEditActivityClick,
  onKioskAssignmentUpdate,
  onDeleteActivity,
  onImportedActivities,
  onClearHistoricalActivities
}: ActivityManagementProps) {
  const [activeTab, setActiveTab] = useState<"activities" | "historical" | "tools" | "logs">("activities");
  
  useEffect(() => {
    if (selectedActivity?.type === 'cup') {
      console.log('Selected cup activity:', selectedActivity);
      if (selectedActivity.matches && selectedActivity.matches.length > 0) {
        console.log(`Cup has ${selectedActivity.matches.length} matches:`, selectedActivity.matches);
        const matchActivities = activities.filter(activity => 
          selectedActivity.matches?.includes(activity.id)
        );
        console.log('Found match activities:', matchActivities.map(m => ({id: m.id, name: m.name, cupId: m.cupId})));
      } else {
        console.log('Cup has no matches defined');
        
        const matchesByCupId = activities.filter(activity => activity.cupId === selectedActivity.id);
        console.log('Any activities with this cupId?', matchesByCupId.map(m => ({id: m.id, name: m.name, cupId: m.cupId})));
      }
    }
  }, [selectedActivity, activities]);
  
  const cupMatches = selectedActivity?.type === 'cup' && selectedActivity.matches 
    ? activities.filter(activity => selectedActivity.matches?.includes(activity.id))
    : [];
  
  if (selectedActivity?.type === 'cup') {
    console.log('Cup matches for display:', cupMatches.map(m => ({id: m.id, name: m.name})));
    
    if (cupMatches.length === 0) {
      const matchesByCupId = activities.filter(activity => activity.cupId === selectedActivity.id);
      console.log('Matches by cupId (not in matches array):', matchesByCupId.map(m => ({id: m.id, name: m.name})));
    }
  }

  const handleKioskUpdate = async (activityId: string, playerId?: string): Promise<boolean> => {
    try {
      onKioskAssignmentUpdate(activityId, playerId);
      return true;
    } catch (error) {
      console.error("Error updating kiosk assignment:", error);
      return false;
    }
  };

  const handleDeleteActivity = async (activityId: string): Promise<boolean> => {
    try {
      if (onDeleteActivity) {
        onDeleteActivity(activityId);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting activity:", error);
      return false;
    }
  };
  
  return (
    <div className="space-y-6">
      <ActivityManagementTabs activeTab={activeTab} setActiveTab={setActiveTab}>
        <TabsContent value="activities" className="space-y-6">
          <ActivityTabContent
            title="Alla aktiviteter"
            activities={activities}
            players={players}
            selectedActivity={selectedActivity}
            selectedActivityTypes={selectedActivityTypes}
            filteredActivities={filteredActivities}
            onActivityTypeChange={onActivityTypeChange}
            onActivitySelect={onActivitySelect}
            onActivityUpdate={onActivityUpdate}
            onAddActivityClick={onAddActivityClick}
            onEditActivityClick={onEditActivityClick}
            handleKioskUpdate={handleKioskUpdate}
            handleDeleteActivity={handleDeleteActivity}
            cupMatches={cupMatches}
          />
        </TabsContent>
        
        <TabsContent value="historical" className="space-y-6">
          <HistoricalActivitiesContent
            activities={activities}
            players={players}
            selectedActivity={selectedActivity}
            selectedActivityTypes={selectedActivityTypes}
            filteredHistoricalActivities={filteredHistoricalActivities}
            onActivityTypeChange={onActivityTypeChange}
            onActivitySelect={onActivitySelect}
            onActivityUpdate={onActivityUpdate}
            onAddActivityClick={onAddActivityClick}
            onEditActivityClick={onEditActivityClick}
            handleKioskUpdate={handleKioskUpdate}
            handleDeleteActivity={handleDeleteActivity}
            cupMatches={cupMatches}
            onClearHistoricalActivities={onClearHistoricalActivities}
          />
        </TabsContent>
        
        <TabsContent value="tools" className="space-y-6">
          <ToolsTabContent 
            onImportedActivities={onImportedActivities}
          />
        </TabsContent>
        
        <TabsContent value="logs">
          <DatabaseLogs />
        </TabsContent>
      </ActivityManagementTabs>
    </div>
  );
}
