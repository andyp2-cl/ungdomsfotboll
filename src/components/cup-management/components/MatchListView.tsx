
import React from "react";
import { Activity } from "@/types/player";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/formatDate";

interface MatchListViewProps {
  matches: Activity[];
  onEditMatch?: (matchId: string) => void;
}

export function MatchListView({ matches, onEditMatch }: MatchListViewProps) {
  return (
    <div className="space-y-2">
      {matches.map((match) => (
        <Card key={match.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">{match.name}</div>
                <div className="text-sm text-muted-foreground flex flex-wrap gap-2 items-center">
                  <span>{formatDate(match.date)}</span>
                  {match.time && <Badge variant="outline" className="font-normal">{match.time}</Badge>}
                  {match.location?.name && (
                    <Badge variant="outline" className="font-normal">
                      {match.location.name}
                      {match.location.description && ` - ${match.location.description}`}
                    </Badge>
                  )}
                  {match.homeScore !== undefined && match.awayScore !== undefined && (
                    <Badge variant="secondary" className="font-semibold">
                      {match.homeScore}-{match.awayScore}
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
                  Redigera
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
