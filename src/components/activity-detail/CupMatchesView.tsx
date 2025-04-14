
import React from "react";
import { Activity } from "@/types/player";
import { formatDate } from "@/utils/formatDate";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CupMatchesViewProps {
  cupActivity: Activity;
  matchActivities: Activity[];
  onActivitySelect?: (activity: Activity) => void;
}

export function CupMatchesView({ 
  cupActivity, 
  matchActivities,
  onActivitySelect 
}: CupMatchesViewProps) {
  if (!matchActivities || matchActivities.length === 0) {
    return (
      <div className="border rounded-md p-6 text-center">
        <h3 className="text-lg font-semibold mb-2">Matcher i cupen</h3>
        <p className="text-muted-foreground mb-4">
          Inga matcher har lagts till i denna cup ännu.
        </p>
      </div>
    );
  }

  // Sort matches by time if available
  const sortedMatches = [...matchActivities].sort((a, b) => {
    if (!a.time && !b.time) return 0;
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });

  return (
    <div className="border rounded-md p-4">
      <h3 className="text-lg font-semibold mb-2">
        Matcher i cupen ({matchActivities.length})
      </h3>
      <Separator className="mb-4" />
      
      <ScrollArea className="max-h-[400px] pr-2">
        <div className="space-y-3">
          {sortedMatches.map((match) => (
            <Card key={match.id} className="overflow-hidden">
              <CardContent className="p-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="font-medium">{match.name}</div>
                    <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
                      {match.time && (
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {match.time}
                        </span>
                      )}
                      
                      {match.location?.name && (
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {match.location.name}
                          {match.location.description && 
                            <span className="text-xs ml-1 opacity-70">({match.location.description})</span>
                          }
                        </span>
                      )}
                      
                      {match.result && (
                        <Badge variant={match.isWin ? "success" : "destructive"}>
                          {match.result}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={() => onActivitySelect && onActivitySelect(match)}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    Visa detaljer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
