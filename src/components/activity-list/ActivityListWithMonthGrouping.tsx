import React, { useState } from "react";
import { ActivityListItem } from "./ActivityListItem";
import { Activity, Player } from "@/types/player";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActivityListWithMonthGroupingProps {
  activities: Activity[];
  onActivitySelect: (activity: Activity) => void;
  selectedActivityId?: string;
  players?: Player[];
  onSelect?: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
  isHistorical?: boolean;
  isMobile?: boolean;
  noResultsMessage?: string;
  allActivities?: Activity[];
}

export function ActivityListWithMonthGrouping({
  activities,
  onActivitySelect,
  selectedActivityId,
  players = [],
  onSelect,
  onPlayerSelect,
  isHistorical = false,
  isMobile = false,
  noResultsMessage = "Inga matcher hittades",
  allActivities = []
}: ActivityListWithMonthGroupingProps) {
  // Gruppera aktiviteter per månad
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = new Date(activity.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('sv-SE', { 
      year: 'numeric', 
      month: 'long' 
    });
    
    if (!groups[monthKey]) {
      groups[monthKey] = {
        name: monthName,
        activities: [],
        date: date
      };
    }
    
    groups[monthKey].activities.push(activity);
    return groups;
  }, {} as Record<string, { name: string; activities: Activity[]; date: Date }>);

  // Sortera månader med nyaste först
  const sortedMonths = Object.entries(groupedActivities)
    .sort(([, a], [, b]) => b.date.getTime() - a.date.getTime());

  // Bestäm vilka månader som ska vara expanderade som standard
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(
    new Set([currentMonth])
  );

  const toggleMonth = (monthKey: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(monthKey)) {
      newExpanded.delete(monthKey);
    } else {
      newExpanded.add(monthKey);
    }
    setExpandedMonths(newExpanded);
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {noResultsMessage}
      </div>
    );
  }

  const handleActivityClick = (activity: Activity) => {
    if (onActivitySelect) {
      onActivitySelect(activity);
    } else if (onSelect) {
      onSelect(activity);
    }
  };

  return (
    <div className="space-y-4">
      {sortedMonths.map(([monthKey, monthData]) => {
        const isExpanded = expandedMonths.has(monthKey);
        const activityCount = monthData.activities.length;
        
        return (
          <Collapsible
            key={monthKey}
            open={isExpanded}
            onOpenChange={() => toggleMonth(monthKey)}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-4 h-auto text-left hover:bg-muted/50 border border-border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="font-semibold text-lg">
                      {monthData.name}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({activityCount} match{activityCount !== 1 ? 'er' : ''})
                  </span>
                </div>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="space-y-2 pl-4">
                {monthData.activities
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(activity => (
                    <ActivityListItem
                      key={activity.id}
                      activity={activity}
                      players={players}
                      onClick={() => handleActivityClick(activity)}
                      onSelect={onSelect}
                      onPlayerSelect={onPlayerSelect}
                      isHistorical={isHistorical}
                      isMobile={isMobile}
                      allActivities={allActivities}
                    />
                  ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
