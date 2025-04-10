
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlayerGoalStat } from "./calculateGoalStats";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronDown, ChevronUp } from "lucide-react"; 

interface PlayerGoalsTableProps {
  playerStats: PlayerGoalStat[];
  onPlayerSelect?: (playerId: string) => void;
}

type SortField = 'name' | 'matches' | 'goals' | 'assists' | 'goalsPerMatch';
type SortDirection = 'asc' | 'desc';

export function PlayerGoalsTable({ playerStats, onPlayerSelect }: PlayerGoalsTableProps) {
  const isMobile = useIsMobile();
  const [sortField, setSortField] = useState<SortField>('goals');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if already sorting by this field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for new sort field
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const sortedStats = [...playerStats].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'matches':
        comparison = a.matches - b.matches;
        break;
      case 'goals':
        comparison = a.goals - b.goals;
        break;
      case 'assists':
        comparison = a.assists - b.assists;
        break;
      case 'goalsPerMatch':
        const aRatio = a.matches > 0 ? a.goals / a.matches : 0;
        const bRatio = b.matches > 0 ? b.goals / b.matches : 0;
        comparison = aRatio - bRatio;
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  const handlePlayerClick = (playerId: string) => {
    if (onPlayerSelect) {
      onPlayerSelect(playerId);
    }
  };
  
  // Helper for showing sort indicators in column headers
  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />;
  };
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('name')}
            >
              Spelare <SortIndicator field="name" />
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('matches')}
            >
              Matcher <SortIndicator field="matches" />
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('goals')}
            >
              Mål <SortIndicator field="goals" />
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('assists')}
            >
              Assist <SortIndicator field="assists" />
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('goalsPerMatch')}
            >
              Mål/Match <SortIndicator field="goalsPerMatch" />
            </TableHead>
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
