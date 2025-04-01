
import React from "react";
import { Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Clock, MapPin } from "lucide-react";

interface ActivityMatchesSectionProps {
  cupMatches: Activity[];
  onActivitySelect?: (activity: Activity) => void;
}

export function ActivityMatchesSection({ 
  cupMatches, 
  onActivitySelect 
}: ActivityMatchesSectionProps) {
  return (
    <div className="border rounded-md p-4">
      <h3 className="text-lg font-semibold mb-3">Matcher i cupen</h3>
      
      {cupMatches && cupMatches.length > 0 ? (
        <div className="space-y-2">
          {cupMatches.map(match => (
            <div key={match.id} className="p-2 border rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{match.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {match.time || "Tid ej satt"}
                    {match.location && (
                      <span className="ml-2">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {match.location.name}
                      </span>
                    )}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8"
                  onClick={() => {
                    if (onActivitySelect) {
                      onActivitySelect(match);
                    }
                  }}
                >
                  Visa
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">Inga matcher tillagda i denna cup ännu.</p>
      )}
    </div>
  );
}
