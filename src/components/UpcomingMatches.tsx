
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Match } from "@/types/match";
import { Player } from "@/types/player";
import { Plus, Users, X } from "lucide-react";

interface UpcomingMatchesProps {
  matches: Match[];
  players: Player[];
  onPlayerAssignment: (matchId: string, playerId: string) => void;
  onPlayerRemoval: (matchId: string, playerId: string) => void;
  renderExtraActions?: (match: Match) => React.ReactNode;
  onMultiPlayerAdd?: (matchId: string) => void;
}

export function UpcomingMatches({
  matches,
  players,
  onPlayerAssignment,
  onPlayerRemoval,
  renderExtraActions,
  onMultiPlayerAdd
}: UpcomingMatchesProps) {
  const getLeagueBadgeColor = (league: string) => {
    if (league.includes("A")) return "bg-green-600 hover:bg-green-700";
    if (league.includes("B")) return "bg-blue-600 hover:bg-blue-700";
    if (league.includes("C")) return "bg-orange-600 hover:bg-orange-700";
    return "bg-gray-500 hover:bg-gray-600";
  };

  const getPlayerCountDisplay = (match: Match) => {
    const currentCount = match.players.length;
    const isFullTeam = currentCount >= 11;
    
    return (
      <div className={`flex items-center gap-1 text-sm ${
        isFullTeam ? 'text-green-600 font-medium' : 'text-muted-foreground'
      }`}>
        <Users className="h-3 w-3" />
        <span>{currentCount}/11</span>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Kommande matcher</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {matches.map(match => (
            <div key={match.id} className="border rounded-lg p-4 space-y-3">
              {/* Match header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-sm text-muted-foreground">
                    {new Date(match.date).toLocaleDateString('sv-SE')} {match.time && `• ${match.time}`}
                  </div>
                  <Badge className={`text-xs px-2 py-1 ${getLeagueBadgeColor(match.league)}`}>
                    {match.league}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {getPlayerCountDisplay(match)}
                  {onMultiPlayerAdd && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMultiPlayerAdd(match.id)}
                      className="h-7 w-7 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                  {renderExtraActions && renderExtraActions(match)}
                </div>
              </div>
              
              {/* Match details */}
              <div className="flex items-center gap-4 text-sm">
                <div className="font-medium">{match.opponent}</div>
                {match.location && (
                  <div className="text-muted-foreground">@ {match.location}</div>
                )}
              </div>
              
              {/* Players */}
              {match.players.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Uttagna spelare
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {match.players.map(playerId => {
                      const player = players.find(p => p.id === playerId);
                      return player ? (
                        <div
                          key={playerId}
                          className="group flex items-center gap-1 bg-muted/50 hover:bg-muted text-xs px-2 py-1 rounded-md transition-colors cursor-pointer"
                          onClick={() => onPlayerRemoval(match.id, playerId)}
                        >
                          <span>{player.name}</span>
                          <X className="h-3 w-3 opacity-0 group-hover:opacity-100 text-destructive transition-opacity" />
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
