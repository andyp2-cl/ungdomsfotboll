
import React, { useState, useEffect } from "react";
import { Activity, Player } from "@/types/player";
import { ActivityDetailWrapper } from "./ActivityDetailWrapper";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { ActivityList } from "@/components/ActivityList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FilterType } from "@/types/tabs";
import { MatchReportSummary } from "@/components/activity-detail/MatchReportSummary";

interface ActivityTabContentProps {
  title: string;
  activities: Activity[];
  players: Player[];
  selectedActivity: Activity | null;
  selectedActivityTypes: string[];
  filteredActivities: Activity[];
  onActivityTypeChange: (type: string) => void;
  onActivitySelect: (activity: Activity | null) => void;
  onActivityUpdate: (activity: Activity) => Promise<void>;
  onAddActivityClick: () => void;
  onEditActivityClick: (activity: Activity) => void;
  handleKioskUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  handleDeleteActivity: (activityId: string) => Promise<boolean>;
  cupMatches: Activity[];
  onMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
  filter?: FilterType;
  isHistorical?: boolean;
}

export function ActivityTabContent({
  title,
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
  handleKioskUpdate,
  handleDeleteActivity,
  cupMatches,
  onMatchResultUpdate,
  filter,
  isHistorical = false
}: ActivityTabContentProps) {
  const [activeTab, setActiveTab] = useState("list");
  const isMobile = useIsMobile();
  
  // Reset to list tab when selected activity is null
  useEffect(() => {
    if (!selectedActivity) {
      setActiveTab("list");
    } else {
      setActiveTab("detail");
    }
  }, [selectedActivity]);

  return (
    <Tabs value={activeTab} className="w-full">
      <div className="flex justify-end mb-4">
        {activeTab === "list" && (
          <Button onClick={onAddActivityClick}>
            <Plus className="h-4 w-4 mr-2" />
            Lägg till aktivitet
          </Button>
        )}
      </div>

      <TabsContent value="list" className="mt-0">
        <ActivityList 
          activities={filteredActivities}
          players={players}
          onSelect={onActivitySelect}
          isHistorical={isHistorical}
          renderExtraContent={(activity) => isHistorical && (
            <MatchReportSummary activity={activity} />
          )}
        />
      </TabsContent>

      <TabsContent value="detail" className="mt-0">
        {selectedActivity && (
          <ActivityDetailWrapper 
            selectedActivity={selectedActivity}
            players={players}
            activities={activities}
            cupMatches={cupMatches}
            onActivitySelect={onActivitySelect}
            onEditActivityClick={onEditActivityClick}
            onActivityUpdate={onActivityUpdate}
            handleKioskUpdate={handleKioskUpdate}
            handleDeleteActivity={handleDeleteActivity}
            handleMatchResultUpdate={onMatchResultUpdate}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}
