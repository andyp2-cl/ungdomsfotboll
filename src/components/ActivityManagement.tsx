
import React, { useState } from "react";
import { Activity, ActivityType, Player } from "@/types/player";
import { ActivityFilter } from "@/components/ActivityFilter";
import { ActivityList } from "@/components/ActivityList";
import { ActivityDetail } from "@/components/ActivityDetail";
import { FileImport } from "@/components/FileImport";
import { MatchScraper } from "@/components/MatchScraper";
import { DatabaseLogs } from "@/components/DatabaseLogs";
import { Button } from "@/components/ui/button";
import { Activity as ActivityIcon, Database, History, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  onImportedActivities: (importedActivities: Activity[]) => void;
  onMatchesScraped: (newActivities: Activity[], clearExisting?: boolean) => void;
  onDeleteAllActivities: () => void;
  onClearHistoricalActivities?: () => void; // Add new prop
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
  onImportedActivities,
  onMatchesScraped,
  onDeleteAllActivities,
  onClearHistoricalActivities
}: ActivityManagementProps) {
  const [activeTab, setActiveTab] = useState<"activities" | "historical" | "tools" | "logs">("activities");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  
  // Get cup matches if the selected activity is a cup
  const cupMatches = selectedActivity?.type === 'cup' && selectedActivity.matches 
    ? activities.filter(activity => selectedActivity.matches?.includes(activity.id))
    : [];
  
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
          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl font-semibold">Alla aktiviteter</h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                <Button 
                  onClick={onAddActivityClick}
                  className="w-full sm:w-auto"
                >
                  <ActivityIcon className="h-4 w-4 mr-2" />
                  Lägg till aktivitet
                </Button>
                <div className="w-full sm:w-auto overflow-x-auto">
                  <ActivityFilter 
                    selectedTypes={selectedActivityTypes}
                    onTypeChange={onActivityTypeChange}
                  />
                </div>
              </div>
            </div>
            
            {selectedActivity ? (
              <ActivityDetail
                activity={selectedActivity}
                players={players}
                cupMatches={cupMatches}
                allActivities={activities}
                onClose={() => onActivitySelect(null)}
                onEdit={onEditActivityClick}
                onActivityUpdate={onActivityUpdate}
                onKioskAssignmentUpdate={onKioskAssignmentUpdate}
                onActivitySelect={onActivitySelect}
              />
            ) : (
              <ActivityList 
                activities={filteredActivities} 
                onSelect={onActivitySelect}
                players={players} 
              />
            )}
          </div>
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
                        Rensa tidigare aktiviteter
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Rensa tidigare aktiviteter</DialogTitle>
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
                          Rensa
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
              <ActivityDetail
                activity={selectedActivity}
                players={players}
                cupMatches={cupMatches}
                allActivities={activities}
                onClose={() => onActivitySelect(null)}
                onEdit={onEditActivityClick}
                onActivityUpdate={onActivityUpdate}
                onKioskAssignmentUpdate={onKioskAssignmentUpdate}
                onActivitySelect={onActivitySelect}
              />
            ) : (
              <ActivityList 
                activities={filteredHistoricalActivities} 
                onSelect={onActivitySelect}
                players={players} 
              />
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileImport onActivitiesImported={onImportedActivities} />
            <MatchScraper 
              onMatchesScraped={onMatchesScraped} 
              onDeleteAllActivities={onDeleteAllActivities}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="logs">
          <DatabaseLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
}
