
import React from 'react';
import { Player, Activity } from "@/types/player";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from '../utils/date-formatter';

interface MatchesTabContentProps {
  player: Player;
  matches: Activity[];
  onActivitySelect: (activity: Activity) => void;
}

export function MatchesTabContent({ player, matches, onActivitySelect }: MatchesTabContentProps) {
  return (
    <>
      {matches.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Match</TableHead>
                <TableHead>Resultat</TableHead>
                <TableHead>Mål</TableHead>
                <TableHead>Assist</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.map(match => (
                <TableRow 
                  key={match.id} 
                  className="cursor-pointer hover:bg-accent/10"
                  onClick={() => onActivitySelect(match)}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{formatDate(match.date)}</span>
                      <span className="text-xs text-muted-foreground">{match.time}</span>
                    </div>
                  </TableCell>
                  <TableCell>{match.name}</TableCell>
                  <TableCell>
                    {match.result ? (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                        {match.result}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {match.player_stats?.goals?.[player.id] ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {match.player_stats.goals[player.id]}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {match.player_stats?.assists?.[player.id] ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {match.player_stats.assists[player.id]}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Spelaren har inte deltagit i några matcher ännu
        </div>
      )}
    </>
  );
}
