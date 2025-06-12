
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Match } from "@/types/match";
import { Player } from "@/types/player";
import { Plus, Users } from "lucide-react";

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
    return "bg-gray-500";
  };

  const getPlayerCountDisplay = (match: Match) => {
    const currentCount = match.players.length;
    const required = match.requiredPlayers || 11;
    const isComplete = currentCount >= required;
    
    return (
      <div className={`flex items-center gap-1 ${isComplete ? 'text-green-600' : 'text-orange-600'}`}>
        <Users className="h-4 w-4" />
        <span className="font-medium">{currentCount}/{required}</span>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Kommande matcher</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum</TableHead>
              <TableHead>Tid</TableHead>
              <TableHead>Motståndare</TableHead>
              <TableHead>Liga</TableHead>
              <TableHead>Plats</TableHead>
              <TableHead>Spelare</TableHead>
              <TableHead>Antal</TableHead>
              {renderExtraActions && <TableHead>Åtgärder</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map(match => (
              <TableRow key={match.id}>
                <TableCell>{new Date(match.date).toLocaleDateString('sv-SE')}</TableCell>
                <TableCell>{match.time}</TableCell>
                <TableCell>{match.opponent}</TableCell>
                <TableCell>
                  <Badge className={getLeagueBadgeColor(match.league)}>
                    {match.league}
                  </Badge>
                </TableCell>
                <TableCell>{match.location}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {match.players.map(playerId => {
                      const player = players.find(p => p.id === playerId);
                      return player ? (
                        <Badge 
                          key={playerId} 
                          variant="outline" 
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground text-xs"
                          onClick={() => onPlayerRemoval(match.id, playerId)}
                        >
                          {player.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  {getPlayerCountDisplay(match)}
                </TableCell>
                {renderExtraActions && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {renderExtraActions(match)}
                      {onMultiPlayerAdd && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onMultiPlayerAdd(match.id)}
                          className="p-1 h-8 w-8"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
