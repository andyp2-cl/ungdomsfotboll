
import React, { useState } from "react";
import { Activity, Player } from "@/types/player";
import { ActivityListItem } from "./ActivityListItem";
import { ActivitySearch } from "./ActivitySearch";

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
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter activities based on search query
  const filteredActivities = searchQuery.trim() === ""
    ? activities
    : activities.filter(activity => 
        activity.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">{noResultsMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <ActivitySearch 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
      />
      
      {filteredActivities.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Inga aktiviteter matchade din sökning</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredActivities.map(activity => (
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
      )}
    </div>
  );
}

export * from "./ActivityListItem";
export * from "./ActivityParticipants";
export * from "./ActivitySearch";
export * from "./CupMatchBadge";
