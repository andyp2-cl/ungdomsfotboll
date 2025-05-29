
import React from "react";
import { Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, ExternalLink, Unlink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LinkedMatchesListProps {
  linkedMatches: Activity[];
  onActivitySelect?: (activity: Activity) => void;
  onUnlinkMatch?: (matchId: string) => Promise<void>;
}

export function LinkedMatchesList({
  linkedMatches,
  onActivitySelect,
  onUnlinkMatch
}: LinkedMatchesListProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('sv-SE');
  };

  if (linkedMatches.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">
            Inga matcher är kopplade till denna cup ännu.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Kopplade matcher 
          <Badge variant="secondary">{linkedMatches.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {linkedMatches.map(match => (
          <div key={match.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50/50">
            <div className="flex-1">
              <div className="font-medium">{match.name}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(match.date)}
                </span>
                {match.time && (
                  <span>{match.time}</span>
                )}
                {match.location?.name && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {match.location.name}
                  </span>
                )}
                {match.participants && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {match.participants.length}
                  </span>
                )}
                {match.homeScore !== undefined && match.awayScore !== undefined && (
                  <Badge variant="outline">
                    {match.homeScore}-{match.awayScore}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onActivitySelect && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onActivitySelect(match)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
              {onUnlinkMatch && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onUnlinkMatch(match.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Unlink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
