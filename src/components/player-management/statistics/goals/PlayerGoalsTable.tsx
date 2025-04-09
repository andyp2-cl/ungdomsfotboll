
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlayerGoalStat } from "./calculateGoalStats";
import { useIsMobile } from "@/hooks/use-mobile";

interface PlayerGoalsTableProps {
  playerStats: PlayerGoalStat[];
  onPlayerSelect?: (playerId: string) => void;
}

export function PlayerGoalsTable({ playerStats, onPlayerSelect }: PlayerGoalsTableProps) {
  const isMobile = useIsMobile();
  const sortedStats = [...playerStats].sort((a, b) => b.goals - a.goals);
  
  const handlePlayerClick = (playerId: string) => {
    if (onPlayerSelect) {
      onPlayerSelect(playerId);
    }
  };
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Spelare</TableHead>
            <TableHead className="text-right">Matcher</TableHead>
            <TableHead className="text-right">Mål</TableHead>
            <TableHead className="text-right">Assist</TableHead>
            <TableHead className="text-right">Mål/Match</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedStats.map((player) => (
            <TableRow 
              key={player.id} 
              className={onPlayerSelect ? "cursor-pointer hover:bg-muted/50" : ""}
              onClick={onPlayerSelect ? () => handlePlayerClick(player.id) : undefined}
            >
              <TableCell className="font-medium">{player.name}</TableCell>
              <TableCell className="text-right">{player.matches}</TableCell>
              <TableCell className="text-right">{player.goals}</TableCell>
              <TableCell className="text-right">{player.assists}</TableCell>
              <TableCell className="text-right">
                {player.matches > 0 
                  ? (player.goals / player.matches).toFixed(2) 
                  : "0.00"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
