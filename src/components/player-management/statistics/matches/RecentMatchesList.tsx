
import React from "react";
import { Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";

interface RecentMatchesListProps {
  historicalMatchActivities: Activity[];
  onActivitySelect?: (activity: Activity) => void;
}

export function RecentMatchesList({ historicalMatchActivities, onActivitySelect }: RecentMatchesListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Senaste matcherna</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {historicalMatchActivities
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10)
            .map(match => (
              <div 
                key={match.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => onActivitySelect?.(match)}
              >
                <div className="flex-1">
                  <div className="font-medium">{match.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    {formatDate(match.date)}
                    {match.location?.description && (
                      <>
                        <MapPin className="h-3 w-3" />
                        {match.location.description}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {match.homeScore !== undefined && match.awayScore !== undefined && (
                    <div className="font-mono text-lg font-bold">
                      {match.homeScore}-{match.awayScore}
                    </div>
                  )}
                  <Badge 
                    variant={match.isWin === true ? "default" : match.isWin === false ? "destructive" : "secondary"}
                    className="min-w-[60px] justify-center"
                  >
                    {match.isWin === true ? "Vinst" : match.isWin === false ? "Förlust" : "Oavgjort"}
                  </Badge>
                </div>
              </div>
            ))}
          {historicalMatchActivities.length === 0 && (
            <div className="text-muted-foreground text-center py-8">
              Inga matcher att visa ännu
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
