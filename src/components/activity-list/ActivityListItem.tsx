
import React from "react";
import { Activity, Player } from "@/types/player";
import { formatActivityDate } from "@/utils/activity/dateUtils";
import { ActivityParticipants } from "./ActivityParticipants";
import { Badge } from "../ui/badge";
import { getOutcomeColorClass } from "../activity-detail/match-result/utils";
import { GradePieChart } from "../activity-detail/match-result/GradePieChart";

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
  
  // Determine if we should show result (only for matches with results)
  const showResult = activity.type === "match" && 
    (activity.homeScore !== undefined && activity.awayScore !== undefined);
    
  // Determine result color class
  let resultColorClass = "";
  if (showResult) {
    // Check for draw first
    if (activity.homeScore === activity.awayScore) {
      resultColorClass = "text-gray-600"; // Draw - gray/black color
    }
    // Check explicit isWin value
    else if (activity.isWin === true) {
      resultColorClass = "text-green-600"; // Win - green color
    } 
    else if (activity.isWin === false) {
      resultColorClass = "text-red-600"; // Loss - red color
    }
    else {
      // Fallback to calculating based on scores (though this shouldn't happen)
      const isHome = activity.name.toLowerCase().includes("hässleholms if") && 
                    activity.name.split(" - ")[0].toLowerCase().includes("hässleholms if");
      
      if (isHome) {
        resultColorClass = activity.homeScore! > activity.awayScore! ? "text-green-600" : "text-red-600";
      } else {
        resultColorClass = activity.awayScore! > activity.homeScore! ? "text-green-600" : "text-red-600";
      }
    }
  }

  // Check if we should show the grade pie chart (only if there are participants)
  const showGradePieChart = activity.type === "match" && 
                           participatingPlayers.length > 0;

  // Visa badge för cupmatcher
  const isCupMatch = activity.cupId !== undefined;

  return (
    <div
      className="group border rounded-md p-4 hover:bg-accent hover:cursor-pointer"
      onClick={handleSelect}
    >
      <div className="flex justify-between items-start">
        <div className="w-3/4">
          <div className="text-lg font-semibold">{activity.name}</div>
          <div className="text-muted-foreground">
            {formatActivityDate(activity.date)}
            {activity.time && ` - ${activity.time}`}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {isCupMatch && (
              <Badge variant="secondary" className="text-xs">
                Cupmatch
              </Badge>
            )}
            <ActivityParticipants 
              participants={participatingPlayers}
              onPlayerSelect={onPlayerSelect}
              isMobile={isMobile}
            />
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2 w-1/4">
          <div className="flex items-center space-x-2">
            {showResult && (
              <span className={`font-bold ${resultColorClass}`}>
                {activity.homeScore}-{activity.awayScore}
              </span>
            )}
            {isHistorical && (
              <Badge variant="outline">
                Tidigare
              </Badge>
            )}
          </div>
          
          {/* Add the grade pie chart to the right side when there are participants */}
          {showGradePieChart && participatingPlayers.length > 3 && (
            <div className="w-full">
              <GradePieChart 
                activity={activity}
                participatingPlayers={participatingPlayers}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
