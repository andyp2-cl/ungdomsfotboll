
import React, { useState } from "react";
import { Activity, ActivityType, Player } from "@/types/player";
import { ActivityFilter } from "@/components/ActivityFilter";
import { ActivityList } from "@/components/ActivityList";
import { ActivityDetail } from "@/components/ActivityDetail";
import { FileImport } from "@/components/FileImport";
import { MatchScraper } from "@/components/MatchScraper";
import { DatabaseLogs } from "@/components/DatabaseLogs";
import { Button } from "@/components/ui/button";
import { Activity as ActivityIcon, Database } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ActivityManagementProps {
  activities: Activity[];
  players: Player[];
  selectedActivity: Activity | null;
  selectedActivityTypes: ActivityType[];
  filteredActivities: Activity[];
  onActivityTypeChange: (type: ActivityType) => void;
  onActivitySelect: (activity: Activity | null) => void;
  onActivityUpdate: (activity: Activity) => void;
  onAddActivityClick: () => void;
  onEditActivityClick: (activity: Activity) => void;
  onKioskAssignmentUpdate: (activityId: string, playerId?: string) => void;
  onImportedActivities: (importedActivities: Activity[]) => void;
  onMatchesScraped: (newActivities: Activity[], clearExisting?: boolean) => void;
  onDeleteAllActivities: () => void;
}

export function ActivityManagement({
  activities,
  players,
  selectedActivity,
  selectedActivityTypes,
  filteredActivities,
  onActivityTypeChange,
  onActivitySelect,
  onActivityUpdate,
  onAddActivityClick,
  onEditActivityClick,
  onKioskAssignmentUpdate,
  onImportedActivities,
  onMatchesScraped,
  onDeleteAllActivities
}: ActivityManagementProps) {
  const [activeTab, setActiveTab] = useState<"activities" | "tools" | "logs">("activities");
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="mb-6">
          <TabsTrigger value="activities">
            <ActivityIcon className="h-4 w-4 mr-2" />
            Aktiviteter
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
                onClose={() => onActivitySelect(null)}
                onEdit={onEditActivityClick}
                onActivityUpdate={onActivityUpdate}
                onKioskAssignmentUpdate={onKioskAssignmentUpdate}
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
