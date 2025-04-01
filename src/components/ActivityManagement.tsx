
import React, { useState, useEffect } from "react";
import { Activity, ActivityType, Player } from "@/types/player";
import { DatabaseLogs } from "@/components/DatabaseLogs";
import { Activity as ActivityIcon, Database, History, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ActivityTabContent, ToolsTabContent } from "@/components/activity-management";

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
  onMatchesScraped: (newActivities: Activity[], clearExisting?: boolean) => void;
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
  onMatchesScraped,
  onClearHistoricalActivities
}: ActivityManagementProps) {
  const [activeTab, setActiveTab] = useState<"activities" | "historical" | "tools" | "logs">("activities");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  
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

  // Wrap the onKioskAssignmentUpdate function to return a Promise<boolean>
  const handleKioskUpdate = async (activityId: string, playerId?: string): Promise<boolean> => {
    try {
      onKioskAssignmentUpdate(activityId, playerId);
      return true;
    } catch (error) {
      console.error("Error updating kiosk assignment:", error);
      return false;
    }
  };

  // Wrap the onDeleteActivity function to return a Promise<boolean>
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
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="mb-6">
          <TabsTrigger value="activities">
            <ActivityIcon className="h-4 w-4 mr-2" />
            Aktiviteter
          </TabsTrigger>
          <TabsTrigger value="historical">
            <History className="h-4 w-4 mr-2" />
            Tidigare aktiviteter
          </TabsTrigger>
          <TabsTrigger value="tools">
            Verktyg
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Database className="h-4 w-4 mr-2" />
            Databaslogg
          </TabsTrigger>
        </TabsList>
        
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
          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl font-semibold">Tidigare aktiviteter</h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                {onClearHistoricalActivities && (
                  <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="destructive"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Ta bort tidigare aktiviteter
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Ta bort tidigare aktiviteter</DialogTitle>
                        <DialogDescription>
                          Detta kommer att ta bort alla tidigare aktiviteter. Denna åtgärd kan inte ångras.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
                          Avbryt
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => {
                            onClearHistoricalActivities();
                            setIsConfirmDialogOpen(false);
                          }}
                        >
                          Ta bort
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                <div className="w-full sm:w-auto overflow-x-auto">
                  <ActivityFilter 
                    selectedTypes={selectedActivityTypes}
                    onTypeChange={onActivityTypeChange}
                  />
                </div>
              </div>
            </div>
            
            {selectedActivity ? (
              <ActivityTabContent
                title="Tidigare aktiviteter"
                activities={activities}
                players={players}
                selectedActivity={selectedActivity}
                selectedActivityTypes={selectedActivityTypes}
                filteredActivities={filteredHistoricalActivities}
                onActivityTypeChange={onActivityTypeChange}
                onActivitySelect={onActivitySelect}
                onActivityUpdate={onActivityUpdate}
                onAddActivityClick={onAddActivityClick}
                onEditActivityClick={onEditActivityClick}
                handleKioskUpdate={handleKioskUpdate}
                handleDeleteActivity={handleDeleteActivity}
                cupMatches={cupMatches}
              />
            ) : (
              <ActivityTabContent
                title="Tidigare aktiviteter"
                activities={activities}
                players={players}
                selectedActivity={selectedActivity}
                selectedActivityTypes={selectedActivityTypes}
                filteredActivities={filteredHistoricalActivities}
                onActivityTypeChange={onActivityTypeChange}
                onActivitySelect={onActivitySelect}
                onActivityUpdate={onActivityUpdate}
                onAddActivityClick={onAddActivityClick}
                onEditActivityClick={onEditActivityClick}
                handleKioskUpdate={handleKioskUpdate}
                handleDeleteActivity={handleDeleteActivity}
                cupMatches={cupMatches}
              />
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="tools" className="space-y-6">
          <ToolsTabContent 
            onImportedActivities={onImportedActivities}
            onMatchesScraped={onMatchesScraped}
          />
        </TabsContent>
        
        <TabsContent value="logs">
          <DatabaseLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
}
