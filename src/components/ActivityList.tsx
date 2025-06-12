
import React from "react";
import { Activity, Player } from "@/types/player";
import { ActivityListItem } from "@/components/activity-list/ActivityListItem";
import { ActivityListWithMonthGrouping } from "@/components/activity-list/ActivityListWithMonthGrouping";

interface ActivityListProps {
  activities: Activity[];
  players?: Player[];
  onSelect?: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
  isHistorical?: boolean;
  isMobile?: boolean;
  noResultsMessage?: string;
  allActivities?: Activity[];
}

export function ActivityList({ 
  activities, 
  players = [], 
  onSelect, 
  onPlayerSelect,
  isHistorical = false,
  isMobile = false,
  noResultsMessage = "Inga aktiviteter att visa",
  allActivities = []
}: ActivityListProps) {
  console.log("ActivityList: Received onPlayerSelect function:", !!onPlayerSelect);
  
  // Handle player selection with logging
  const handlePlayerSelectWithLogging = (playerId: string) => {
    console.log("ActivityList: handlePlayerSelectWithLogging called with:", playerId);
    if (onPlayerSelect) {
      console.log("ActivityList: Calling onPlayerSelect");
      onPlayerSelect(playerId);
    } else {
      console.log("ActivityList: No onPlayerSelect function provided");
    }
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {noResultsMessage}
      </div>
    );
  }

  // Use month grouping for historical activities, regular list for current activities
  if (isHistorical) {
    return (
      <ActivityListWithMonthGrouping
        activities={activities}
        players={players}
        onSelect={onSelect}
        onPlayerSelect={handlePlayerSelectWithLogging}
        isHistorical={isHistorical}
        isMobile={isMobile}
        noResultsMessage={noResultsMessage}
        allActivities={allActivities}
        onActivitySelect={onSelect || (() => {})}
      />
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <ActivityListItem
          key={activity.id}
          activity={activity}
          players={players}
          onSelect={onSelect}
          onPlayerSelect={handlePlayerSelectWithLogging}
          isHistorical={isHistorical}
          isMobile={isMobile}
          allActivities={allActivities}
        />
      ))}
    </div>
  );
}
