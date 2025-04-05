
import React from "react";
import { Activity, Player } from "@/types/player";
import { formatActivityDate } from "@/utils/activity/dateUtils";
import { ActivityParticipants } from "./ActivityParticipants";
import { Badge } from "../ui/badge";

interface ActivityListItemProps {
  activity: Activity;
  players: Player[];
  onSelect?: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
  isHistorical?: boolean;
  isMobile?: boolean;
}

export function ActivityListItem({
  activity,
  players,
  onSelect,
  onPlayerSelect,
  isHistorical: forceHistorical,
  isMobile = false
}: ActivityListItemProps) {
  // Calculate if the activity is historical based on date and time
  const isHistorical = forceHistorical || (() => {
    const now = new Date();
    const activityDate = new Date(activity.date);
    
    // If there's a time specified, add it to the activity date
    if (activity.time) {
      const [hours, minutes] = activity.time.split(':').map(Number);
      activityDate.setHours(hours || 0, minutes || 0);
    } else {
      // If no time specified, use end of day (23:59:59)
      activityDate.setHours(23, 59, 59);
    }
    
    return activityDate < now;
  })();
  
  const handleSelect = () => {
    if (onSelect) {
      onSelect(activity);
    }
  };

  // Find participants for this activity
  const participatingPlayers = players.filter(player => 
    activity.participants?.includes(player.id)
  );

  return (
    <div
      className="group border rounded-md p-4 hover:bg-accent hover:cursor-pointer"
      onClick={handleSelect}
    >
      <div className="flex justify-between items-start">
        <div className="text-lg font-semibold">{activity.name}</div>
        {isHistorical && (
          <Badge variant="outline">
            Tidigare
          </Badge>
        )}
      </div>
      <div className="text-muted-foreground">
        {formatActivityDate(activity.date)}
        {activity.time && ` - ${activity.time}`}
      </div>
      <div className="mt-2">
        <ActivityParticipants 
          participants={participatingPlayers}
          onPlayerSelect={onPlayerSelect}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
}
