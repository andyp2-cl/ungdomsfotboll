
import React from "react";
import { Activity, Player } from "@/types/player";
import { ActivityFilter } from "@/components/ActivityFilter";
import { ActivityList } from "@/components/ActivityList";
import { ActivityDetailWrapper } from "./ActivityDetailWrapper";
import { Button } from "@/components/ui/button";
import { Activity as ActivityIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  onMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
  cupMatches: Activity[];
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
  onMatchResultUpdate,
  cupMatches
}: ActivityTabContentProps) {
  const { isMobile } = useIsMobile();

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <Button 
            onClick={onAddActivityClick}
            className="w-full sm:w-auto"
          >
            <ActivityIcon className="h-4 w-4 mr-2" />
            Lägg till aktivitet
          </Button>
          <div className={`${isMobile ? 'w-full overflow-x-auto pb-2' : 'w-full sm:w-auto overflow-x-auto'}`}>
            <ActivityFilter 
              selectedTypes={selectedActivityTypes}
              onTypeChange={onActivityTypeChange}
              isMobile={isMobile}
            />
          </div>
        </div>
      </div>
      
      {selectedActivity ? (
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
          onMatchResultUpdate={onMatchResultUpdate}
        />
      ) : (
        <ActivityList 
          activities={filteredActivities} 
          onSelect={onActivitySelect}
          players={players} 
          isMobile={isMobile}
        />
      )}
    </div>
  );
}
