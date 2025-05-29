
import React from "react";
import { Player, Activity } from "@/types/player";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, UserCircle } from "lucide-react";
import { SortField, SortIcon } from "./PlayerListSorting";
import { calculatePlayerStats } from "@/components/player-match-history/utils/stats-calculator";
import { formatPositions, isTrainer } from "@/utils/positionUtils";

interface PlayerListTableProps {
  players: Player[];
  activities?: Activity[];
  sortField: SortField;
  sortDirection: 'asc' | 'desc';
  toggleSort: (field: SortField) => void;
  onPlayerSelect: (player: Player) => void;
  onPlayerEdit?: (player: Player) => void;
}

export function PlayerListTable({ 
  players, 
  activities = [],
  sortField, 
  sortDirection, 
  toggleSort, 
  onPlayerSelect, 
  onPlayerEdit 
}: PlayerListTableProps) {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-green-500 hover:bg-green-600';
      case 'B':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'C':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'D':
        return 'bg-purple-500 hover:bg-purple-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  // Calculate winrate for each player
  const getPlayerWinRate = (player: Player) => {
    console.log(`Calculating winrate for ${player.name}:`, {
      playerId: player.id,
      totalActivities: activities.length,
      activities: activities.map(a => ({ id: a.id, type: a.type, participants: a.participants }))
    });
    
    // Filter all activities to get only matches where this player participated
    const playerMatches = activities.filter(activity => 
      activity.type === "match" && 
      activity.participants?.includes(player.id)
    );
    
    console.log(`${player.name} matches:`, playerMatches.length, playerMatches.map(m => ({ 
      id: m.id, 
      name: m.name, 
      isWin: m.isWin, 
      homeScore: m.homeScore, 
      awayScore: m.awayScore 
    })));
    
    if (playerMatches.length === 0) {
      console.log(`${player.name} has no matches`);
      return 0;
    }
    
    const stats = calculatePlayerStats(player, playerMatches);
    console.log(`${player.name} stats:`, stats);
    return stats.winRate;
  };

  // Calculate goals per match for each player
  const getPlayerGoalsPerMatch = (player: Player) => {
    // Filter all activities to get only matches where this player participated
    const playerMatches = activities.filter(activity => 
      activity.type === "match" && 
      activity.participants?.includes(player.id)
    );
    
    if (playerMatches.length === 0) {
      return 0;
    }
    
    const stats = calculatePlayerStats(player, playerMatches);
    
    // Calculate goals per match
    const goalsPerMatch = stats.matches > 0 ? stats.totalGoals / stats.matches : 0;
    return Math.round(goalsPerMatch * 100) / 100; // Round to 2 decimal places
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Bild</TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => toggleSort('name')}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Namn
                <SortIcon field="name" sortField={sortField} sortDirection={sortDirection} />
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => toggleSort('grade')}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Nivå
                <SortIcon field="grade" sortField={sortField} sortDirection={sortDirection} />
              </Button>
            </TableHead>
            <TableHead>Position</TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => toggleSort('activities')}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Aktiviteter
                <SortIcon field="activities" sortField={sortField} sortDirection={sortDirection} />
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => toggleSort('winrate')}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Winrate
                <SortIcon field="winrate" sortField={sortField} sortDirection={sortDirection} />
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => toggleSort('goalsPerMatch')}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Mål per match
                <SortIcon field="goalsPerMatch" sortField={sortField} sortDirection={sortDirection} />
              </Button>
            </TableHead>
            <TableHead className="w-[100px]">Åtgärder</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => {
            const isCoach = isTrainer(player.positions);
            const winRate = getPlayerWinRate(player);
            const goalsPerMatch = getPlayerGoalsPerMatch(player);
            
            return (
              <TableRow 
                key={player.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onPlayerSelect(player)}
              >
                <TableCell>
                  {player.image ? (
                    <img 
                      src={player.image} 
                      alt={player.name}
                      className="h-12 w-12 rounded-full object-cover"
                      loading="lazy"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <UserCircle className="h-12 w-12 text-muted-foreground" />
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {player.name}
                    {player.jerseyNumber && !isCoach && (
                      <span className="ml-2 text-xs bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded-full">
                        #{player.jerseyNumber}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {isCoach ? (
                    <Badge className="bg-amber-500 hover:bg-amber-600">
                      Tränare
                    </Badge>
                  ) : (
                    <Badge className={getGradeColor(player.grade || '')}>
                      Nivå {player.grade}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {isCoach ? (
                    <span className="text-muted-foreground">-</span>
                  ) : (
                    <span className="text-sm">
                      {player.positions && player.positions.length > 0
                        ? formatPositions(player.positions, true)
                        : 'Ingen position'}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {player.activities?.length || 0}
                </TableCell>
                <TableCell>
                  {isCoach ? (
                    <span className="text-muted-foreground">-</span>
                  ) : (
                    <span className="font-medium text-primary">
                      {winRate}%
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {isCoach ? (
                    <span className="text-muted-foreground">-</span>
                  ) : (
                    <span className="font-medium text-blue-600">
                      {goalsPerMatch}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {onPlayerEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayerEdit(player);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
