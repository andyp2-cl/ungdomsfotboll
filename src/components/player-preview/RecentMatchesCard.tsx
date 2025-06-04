
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Player, Activity } from "@/types/player";
import { Calendar, MapPin, Trophy, Target, Users } from "lucide-react";
import { MatchPreview } from "@/components/player-match-history/components/MatchPreview";

interface RecentMatchesCardProps {
  player: Player;
  activities: Activity[];
}

export function RecentMatchesCard({ player, activities }: RecentMatchesCardProps) {
  const [selectedMatch, setSelectedMatch] = useState<Activity | null>(null);
  
  // Get recent matches for this player
  const playerMatches = activities
    .filter(activity => 
      activity.type === "match" && 
      activity.participants?.includes(player.id)
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatResult = (match: Activity) => {
    if (match.homeScore !== undefined && match.awayScore !== undefined && 
        match.homeScore !== null && match.awayScore !== null) {
      return `${match.homeScore}-${match.awayScore}`;
    }
    if (match.result && !match.result.includes('null') && !match.result.includes('undefined')) {
      return match.result;
    }
    return null;
  };

  const getResultColor = (match: Activity) => {
    if (match.isWin === true) return "text-green-600";
    if (match.isWin === false) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Senaste matcher
          </CardTitle>
        </CardHeader>
        <CardContent>
          {playerMatches.length > 0 ? (
            <div className="space-y-3">
              {playerMatches.map((match) => {
                const goals = match.player_stats?.goals?.[player.id] || 0;
                const assists = match.player_stats?.assists?.[player.id] || 0;
                
                return (
                  <div
                    key={match.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedMatch(match)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{match.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(match.date)}</span>
                          {match.location?.name && (
                            <>
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{match.location.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {formatResult(match) && (
                          <Badge variant="outline" className={`${getResultColor(match)} border-current`}>
                            {formatResult(match)}
                          </Badge>
                        )}
                        {(goals > 0 || assists > 0) && (
                          <div className="flex gap-1">
                            {goals > 0 && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                {goals}🥅
                              </Badge>
                            )}
                            {assists > 0 && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                {assists}👟
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Inga matcher registrerade
            </p>
          )}
        </CardContent>
      </Card>

      <MatchPreview
        match={selectedMatch}
        isOpen={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
        players={[]}
      />
    </>
  );
}
