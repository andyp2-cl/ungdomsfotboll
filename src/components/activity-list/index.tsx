
import React from "react";
import { ActivityListItem } from "./ActivityListItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Player } from "@/types/player";

interface ActivityListProps {
  activities: Activity[];
  players: Player[];
  onSelect: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
  isHistorical?: boolean;
  isMobile?: boolean;
  noResultsMessage?: string;
}

export function ActivityList({ 
  activities, 
  players, 
  onSelect, 
  onPlayerSelect,
  isHistorical = false, 
  isMobile,
  noResultsMessage = "Inga aktiviteter hittades" 
}: ActivityListProps) {
  if (activities.length === 0) {
    return (
      <div className="p-8 text-center">
        <h3 className="font-semibold text-lg mb-2">Inga aktiviteter</h3>
        <p className="text-muted-foreground">{noResultsMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-4">
      <ScrollArea className="h-full pr-4">
        <div className="space-y-3 pb-2">
          {activities.map((activity) => (
            <ActivityListItem
              key={activity.id}
              activity={activity}
              players={players}
              onSelect={onSelect}
              onPlayerSelect={onPlayerSelect}
              isHistorical={isHistorical}
              isMobile={isMobile}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// Re-export components for use in other files
export * from './ActivityHeader';
export * from './ActivityMeta';
export * from './ActivitySidebar';
export * from './ActivityParticipants';
export * from './utils/result-utils';
