
import React from "react";
import { Activity } from "@/types/player";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Clock, MapPin, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/formatDate";
import { QuickMatchResult } from "@/components/activity-detail/QuickMatchResult";
import { isHomeMatch } from "@/components/activity-detail/match-result/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface MatchListViewProps {
  matches: Activity[];
  onEditMatch?: (matchId: string) => void;
  onMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
}

export function MatchListView({ matches, onEditMatch, onMatchResultUpdate }: MatchListViewProps) {
  const isMobile = useIsMobile();
  
  const getResultTextColor = (activity: Activity): string => {
    if (activity.homeScore === undefined || activity.awayScore === undefined) {
      return "";
    }
    
    if (activity.homeScore === activity.awayScore) {
      return "text-black";
    }
    
    if (typeof activity.isWin === 'boolean') {
      return activity.isWin ? "text-green-600" : "text-red-600";
    }
    
    const isHome = isHomeMatch(activity);
    const isWin = isHome ? 
      activity.homeScore > activity.awayScore : 
      activity.awayScore > activity.homeScore;
    
    return isWin ? "text-green-600" : "text-red-600";
  };
  
  return (
    <div className="space-y-3">
      {matches.map((match) => (
        <Card key={match.id} className="overflow-hidden">
          <CardContent className={isMobile ? "p-3" : "p-4"}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-medium flex items-center gap-1">
                    {match.name}
                    {match.cupId && (
                      <Badge variant="outline" className="ml-1">
                        <Trophy className="h-3 w-3 mr-1" />
                        Cupmatch
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground flex flex-wrap gap-2 items-center">
                    <span>{formatDate(match.date)}</span>
                    {match.time && (
                      <Badge variant="outline" className="font-normal flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {match.time}
                      </Badge>
                    )}
                    {match.location?.name && (
                      <Badge variant="outline" className="font-normal flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {match.location.name}
                        {match.location.description && (isMobile ? "" : ` - ${match.location.description}`)}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {onEditMatch && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEditMatch(match.id)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {isMobile ? "" : "Redigera"}
                  </Button>
                )}
              </div>
              
              {match.homeScore !== undefined && match.awayScore !== undefined && (
                <div className={`${isMobile ? "text-base" : "text-lg"} font-bold mt-1 ${getResultTextColor(match)}`}>
                  Resultat: {match.homeScore}-{match.awayScore}
                </div>
              )}
              
              {onMatchResultUpdate && (
                <div className="mt-2">
                  <QuickMatchResult
                    activity={match}
                    onSave={(homeScore, awayScore) => 
                      onMatchResultUpdate(match.id, homeScore, awayScore)
                    }
                    isReadOnly={false}
                    resultColorClass={getResultTextColor(match)}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
