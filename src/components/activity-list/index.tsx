
import React from "react";
import { Activity, Player } from "@/types/player";
import { ActivityListItem } from "./ActivityListItem";

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
  isMobile = false,
  noResultsMessage = "Inga aktiviteter hittades"
}: ActivityListProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">{noResultsMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 gap-4">
      {activities.map(activity => (
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
  );
}

export * from "./ActivityListItem";
export * from "./ActivityParticipants";
export * from "./ActivitySearch";
export * from "./CupMatchBadge";
