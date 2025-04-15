
import { Activity } from "@/types/player";
import { MapPin, Calendar, Clock, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CupMatchBadge } from "../activity-list/CupMatchBadge";

interface ActivityDetailHeaderContentProps {
  activity: Activity;
  formattedDate: string;
  capitalizedDayOfWeek: string;
  isHistorical: boolean;
  formatResult: () => string;
}

export function ActivityDetailHeaderContent({
  activity,
  formattedDate,
  capitalizedDayOfWeek,
  isHistorical,
  formatResult
}: ActivityDetailHeaderContentProps) {
  const result = formatResult();
  const isCupMatch = !!activity.cupId;

  return (
    <div className="space-y-1 flex-1">
      <div className="flex items-center gap-2 flex-wrap">
        <h2 className="text-base font-semibold text-foreground line-clamp-2 pr-1">
          {activity.name}
        </h2>
        {isCupMatch && <CupMatchBadge compact={true} />}
      </div>
      
      <div className="flex flex-col text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            {capitalizedDayOfWeek} {formattedDate}
          </span>
          {activity.time && (
            <>
              <span className="mx-1">•</span>
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>{activity.time}</span>
            </>
          )}
        </div>
        
        {activity.location?.name && (
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>
              {activity.location.name}
              {activity.location.description && (
                <span className="text-xs opacity-75"> ({activity.location.description})</span>
              )}
            </span>
          </div>
        )}
        
        {isHistorical && result && (
          <div className="mt-1">
            <Badge 
              variant={activity.isWin ? "success" : 
                     (activity.homeScore === activity.awayScore && 
                      activity.homeScore !== undefined && 
                      activity.awayScore !== undefined) ? "outline" : "destructive"}
              className="font-semibold"
            >
              Resultat: {result}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
