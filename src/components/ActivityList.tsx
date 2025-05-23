
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader } from "./ui/card";
import { Activity, Player } from '@/types/player';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatDate } from '@/utils/formatDate';
import { cn } from '@/lib/utils';

interface ActivityListProps {
  activities: Activity[];
  players: Player[];
  onSelect: (activity: Activity) => void;
  isHistorical?: boolean;
  isMobile?: boolean;
  noResultsMessage?: string;
  onPlayerSelect?: (playerId: string) => void;
  renderExtraContent?: (activity: Activity) => React.ReactNode;
}

export function ActivityList({ 
  activities, 
  players, 
  onSelect,
  isHistorical = false,
  isMobile: propIsMobile,
  noResultsMessage = "Inga aktiviteter hittades",
  onPlayerSelect,
  renderExtraContent
}: ActivityListProps) {
  const isMobileHook = useIsMobile();
  const isMobile = propIsMobile !== undefined ? propIsMobile : isMobileHook;
  
  const sortedActivities = useMemo(() => {
    if (!activities) return [];
    
    // Sort activities by date
    return [...activities].sort((a, b) => {
      // For historical view, show newest first
      if (isHistorical) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      // For upcoming view, show soonest first
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [activities, isHistorical]);
  
  const formatDayText = (date: string) => {
    const activityDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (activityDate.toDateString() === today.toDateString()) {
      return "Idag";
    } else if (activityDate.toDateString() === tomorrow.toDateString()) {
      return "Imorgon";
    } else {
      return formatDate(date);
    }
  };
  
  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <p className="text-muted-foreground">{noResultsMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedActivities.map((activity) => (
        <Card 
          key={activity.id}
          className={cn(
            "cursor-pointer transition-shadow hover:shadow-md",
            activity.type === "cup" && "border-amber-200 bg-amber-50/30"
          )}
          onClick={() => onSelect(activity)}
        >
          <CardHeader className={cn("flex flex-row items-center justify-between py-4", isMobile && "px-4")}>
            <div className={`flex items-center ${isMobile ? 'flex-col items-start gap-1' : 'gap-4'}`}>
              <span className={cn(
                "px-2 py-1 rounded text-xs font-medium",
                activity.type === "match" ? "bg-green-100" : "bg-amber-200"
              )}>
                {activity.type === "match" ? "Match" : "Cup"}
              </span>
              
              <span className={cn(
                "text-sm",
                isHistorical && "text-muted-foreground"
              )}>
                {formatDayText(activity.date)}
                {activity.time && ` • ${activity.time}`}
              </span>
              
              {activity.result && (
                <span className="font-medium text-sm ml-2">
                  {activity.result}
                </span>
              )}
            </div>
            
            {activity.location?.name && (
              <div className="text-xs text-muted-foreground hidden md:block truncate max-w-[200px]">
                {activity.location.name}
              </div>
            )}
          </CardHeader>
          
          <CardContent className={cn("pt-0 pb-4", isMobile && "px-4")}>
            <h3 className="font-semibold text-lg mb-2">{activity.name}</h3>
            
            {activity.participants && activity.participants.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="text-xs text-muted-foreground">
                  {activity.participants.length} deltagare
                </span>
              </div>
            )}
            
            {renderExtraContent && renderExtraContent(activity)}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
