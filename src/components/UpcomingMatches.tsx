import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Match } from "@/types/match";
import { Player } from "@/types/player";
import { Plus, Users, X } from "lucide-react";
import { sortPlayersByGradeAndRatio } from "@/utils/teamSelectionUtils";

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
        <span>{currentCount} uttagna</span>
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
                  <div className="flex flex-col gap-2">
                    {['A', 'B', 'C', 'D'].map(grade => {
                      const gradePlayers = match.players
                        .map(playerId => players.find(p => p.id === playerId))
                        .filter(player => player && player.grade === grade);
                        
                      if (gradePlayers.length === 0) return null;
                      
                      return (
                        <div key={grade} className="space-y-1">
                          <div className="text-xs font-medium text-muted-foreground">
                            Nivå {grade}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {gradePlayers.map(player => player && (
                              <div
                                key={player.id}
                                className="group flex items-center gap-2 bg-muted/50 hover:bg-muted text-xs px-3 py-2 rounded-md transition-colors cursor-pointer"
                                onClick={() => onPlayerRemoval(match.id, player.id)}
                              >
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={player.image} alt={player.name} />
                                  <AvatarFallback className="text-xs">
                                    {player.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{player.name}</span>
                                <X className="h-3 w-3 opacity-0 group-hover:opacity-100 text-destructive transition-opacity" />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
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
