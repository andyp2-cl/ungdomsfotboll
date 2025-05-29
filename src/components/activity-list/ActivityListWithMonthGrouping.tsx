
import React from "react";
import { Activity, Player } from "@/types/player";
import { ActivityListItem } from "./ActivityListItem";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

interface ActivityListWithMonthGroupingProps {
  activities: Activity[];
  players?: Player[];
  onSelect?: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
  isHistorical?: boolean;
  isMobile?: boolean;
  noResultsMessage?: string;
}

interface MonthGroup {
  monthKey: string;
  monthLabel: string;
  activities: Activity[];
}

export function ActivityListWithMonthGrouping({ 
  activities, 
  players = [], 
  onSelect, 
  onPlayerSelect,
  isHistorical = true,
  isMobile = false,
  noResultsMessage = "Inga aktiviteter att visa"
}: ActivityListWithMonthGroupingProps) {
  console.log("ActivityListWithMonthGrouping: Received onPlayerSelect function:", !!onPlayerSelect);
  
  // Handle player selection with logging
  const handlePlayerSelectWithLogging = (playerId: string) => {
    console.log("ActivityListWithMonthGrouping: handlePlayerSelectWithLogging called with:", playerId);
    if (onPlayerSelect) {
      console.log("ActivityListWithMonthGrouping: Calling onPlayerSelect");
      onPlayerSelect(playerId);
    } else {
      console.log("ActivityListWithMonthGrouping: No onPlayerSelect function provided");
    }
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {noResultsMessage}
      </div>
    );
  }

  // Group activities by month
  const monthGroups: MonthGroup[] = React.useMemo(() => {
    const groupedByMonth = activities.reduce((acc, activity) => {
      const date = new Date(activity.date);
      const monthKey = format(date, 'yyyy-MM');
      const monthLabel = format(date, 'MMMM yyyy', { locale: sv });
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          monthKey,
          monthLabel: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
          activities: []
        };
      }
      
      acc[monthKey].activities.push(activity);
      return acc;
    }, {} as Record<string, MonthGroup>);

    // Sort by month (newest first) and sort activities within each month
    return Object.values(groupedByMonth)
      .sort((a, b) => b.monthKey.localeCompare(a.monthKey))
      .map(group => ({
        ...group,
        activities: group.activities.sort((a, b) => {
          const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
          if (dateComparison === 0 && a.time && b.time) {
            return b.time.localeCompare(a.time);
          }
          return dateComparison;
        })
      }));
  }, [activities]);

  // Determine which months should be expanded by default (only current month)
  const currentMonth = format(new Date(), 'yyyy-MM');
  const defaultExpandedMonths = [currentMonth];

  return (
    <div className="space-y-4">
      <Accordion type="multiple" defaultValue={defaultExpandedMonths} className="w-full">
        {monthGroups.map((monthGroup) => (
          <AccordionItem key={monthGroup.monthKey} value={monthGroup.monthKey} className="border rounded-lg mb-4">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-left">{monthGroup.monthLabel}</span>
                <span className="text-sm text-muted-foreground mr-4">
                  {monthGroup.activities.length} aktivitet{monthGroup.activities.length !== 1 ? 'er' : ''}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                {monthGroup.activities.map((activity) => (
                  <ActivityListItem
                    key={activity.id}
                    activity={activity}
                    players={players}
                    onSelect={onSelect}
                    onPlayerSelect={handlePlayerSelectWithLogging}
                    isHistorical={isHistorical}
                    isMobile={isMobile}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
