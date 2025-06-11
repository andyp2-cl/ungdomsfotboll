import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Match } from "@/types/match";
import { Player } from "@/types/player";

interface UpcomingMatchesProps {
  matches: Match[];
  players: Player[];
  onPlayerAssignment: (matchId: string, playerId: string) => void;
  onPlayerRemoval: (matchId: string, playerId: string) => void;
  renderExtraActions?: (match: Match) => React.ReactNode;
}

export function UpcomingMatches({ 
  matches, 
  players, 
  onPlayerAssignment, 
  onPlayerRemoval, 
  renderExtraActions
}: UpcomingMatchesProps) {
  const getLeagueBadgeColor = (league: string) => {
    return "bg-gray-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kommande matcher</CardTitle>
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
              {renderExtraActions && <TableHead></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map((match) => (
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
                    {match.players.map((playerId) => {
                      const player = players.find(p => p.id === playerId);
                      return player ? (
                        <Badge 
                          key={playerId}
                          variant="outline"
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => onPlayerRemoval(match.id, playerId)}
                        >
                          {player.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </TableCell>
                {renderExtraActions && (
                  <TableCell>{renderExtraActions(match)}</TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 