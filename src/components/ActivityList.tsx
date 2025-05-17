
import React from "react";
import { Activity, Player } from "@/types/player";
import { ActivityListItem } from "./activity-list/ActivityListItem";
import { EmptyState } from "./ui/empty-state";
import { ScrollArea } from "./ui/scroll-area";

interface ActivityListProps {
  activities: Activity[];
  onSelect: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
  players: Player[];
  isMobile?: boolean;
  isHistorical?: boolean;
  noResultsMessage?: string;
}

export function ActivityList({
  activities,
  onSelect,
  onPlayerSelect,
  players,
  isMobile,
  isHistorical = false,
  noResultsMessage = "Inga aktiviteter hittades"
}: ActivityListProps) {
  if (activities.length === 0) {
    return (
      <EmptyState
        title="Inga aktiviteter"
        description={noResultsMessage}
      />
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
