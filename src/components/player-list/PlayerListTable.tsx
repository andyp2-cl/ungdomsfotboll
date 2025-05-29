
import React from "react";
import { Player, Activity } from "@/types/player";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, UserCircle } from "lucide-react";
import { SortField, SortIcon } from "./PlayerListSorting";
import { DevelopmentChart } from "@/components/player-detail/DevelopmentChart";
import { calculatePlayerStats } from "@/components/player-match-history/utils/stats-calculator";

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
  const formatPosition = (positions: string[] | undefined) => {
    if (!positions || positions.length === 0) return "Ingen position";
    
    return positions
      .filter(pos => pos !== 'TRÄNARE')
      .map(position => {
        if (position === 'TRÄNARE') return 'Tränare';
        
        return position
          .replace('MV', 'Målvakt')
          .replace('BACK', 'Back')
          .replace('MF', 'Mittfält')
          .replace('ANF', 'Anfall');
      })
      .join(', ') || "Tränare";
  };

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
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => toggleSort('position')}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Position
                <SortIcon field="position" sortField={sortField} sortDirection={sortDirection} />
              </Button>
            </TableHead>
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
            <TableHead className="w-[120px]">Utveckling</TableHead>
            <TableHead className="w-[100px]">Åtgärder</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => {
            const isCoach = player.positions?.includes('TRÄNARE');
            const winRate = getPlayerWinRate(player);
            
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
                  <span className="text-sm text-muted-foreground">
                    {formatPosition(player.positions)}
                  </span>
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
                  {!isCoach && (
                    <DevelopmentChart 
                      development={player.development}
                      minimal={true}
                      className="h-16 w-16"
                    />
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
