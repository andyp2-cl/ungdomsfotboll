
import React from "react";
import { Activity, Player } from "@/types/player";
import { ActivityListItem } from "./ActivityListItem";
import { format, parseISO } from "date-fns";
import { sv } from "date-fns/locale";

interface ActivityListWithMonthGroupingProps {
  activities: Activity[];
  players: Player[];
  onSelect?: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
  isHistorical?: boolean;
  isMobile?: boolean;
  noResultsMessage?: string;
  allActivities?: Activity[]; // Add this prop
}

export function ActivityListWithMonthGrouping({
  activities,
  players,
  onSelect,
  onPlayerSelect,
  isHistorical = false,
  isMobile = false,
  noResultsMessage = "Inga aktiviteter att visa",
  allActivities = [] // Add default value
}: ActivityListWithMonthGroupingProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {noResultsMessage}
      </div>
    );
  }

  // Group activities by month
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = parseISO(activity.date);
    const monthKey = format(date, "yyyy-MM");
    const monthLabel = format(date, "MMMM yyyy", { locale: sv });
    
    if (!groups[monthKey]) {
      groups[monthKey] = {
        label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
        activities: []
      };
    }
    
    groups[monthKey].activities.push(activity);
    return groups;
  }, {} as Record<string, { label: string; activities: Activity[] }>);

  // Sort months in descending order (newest first)
  const sortedMonths = Object.entries(groupedActivities).sort(([a], [b]) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      {sortedMonths.map(([monthKey, { label, activities: monthActivities }]) => (
        <div key={monthKey} className="space-y-3">
          <h3 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'} text-muted-foreground border-b pb-1`}>
            {label}
          </h3>
          <div className="space-y-3">
            {monthActivities.map((activity) => (
              <ActivityListItem
                key={activity.id}
                activity={activity}
                players={players}
                onSelect={onSelect}
                onPlayerSelect={onPlayerSelect}
                isHistorical={isHistorical}
                isMobile={isMobile}
                allActivities={allActivities}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
