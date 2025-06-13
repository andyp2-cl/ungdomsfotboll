import React from "react";
import { Activity, Player } from "@/types/player";
import { ActivityListWithMonthGrouping } from "@/components/activity-list/ActivityListWithMonthGrouping";

interface CupsListProps {
  cupActivities: Activity[];
  players: Player[];
  onActivitySelect: (activity: Activity) => void;
  onPlayerSelect: (playerId: string) => void;
  isMobile: boolean;
}

export function CupsList({ 
  cupActivities, 
  players, 
  onActivitySelect,
  onPlayerSelect,
  isMobile 
}: CupsListProps) {
  // Group cup activities by cup name
  const groupedCups = cupActivities.reduce((acc: Record<string, { matches: Activity[] }>, activity) => {
    if (!activity.cupName) return acc;

    const cupName = activity.cupName;
    if (!acc[cupName]) {
      acc[cupName] = { matches: [] };
    }
    acc[cupName].matches.push(activity);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(groupedCups).map(([cupName, cupData]) => (
        <div key={cupName} className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="text-lg font-semibold">{cupName}</h3>
            <p className="text-sm text-muted-foreground">
              {cupData.matches.length} matcher
            </p>
          </div>
          
          <ActivityListWithMonthGrouping
            activities={cupData.matches}
            players={players}
            onSelect={onActivitySelect}
            onActivitySelect={onActivitySelect}
            onPlayerSelect={onPlayerSelect}
            isHistorical={true}
            isMobile={isMobile}
            noResultsMessage="Inga cupmatcher hittades"
          />
        </div>
      ))}
    </div>
  );
}
