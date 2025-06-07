
import React from "react";
import { Player, Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, UserCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SortField, SortIcon, usePlayerSorting } from "./PlayerListSorting";
import { calculatePlayerStats } from "@/components/player-match-history/utils/stats-calculator";
import { formatPositions, isTrainer } from "@/utils/positionUtils";
import { PlayerStatusIndicator } from "@/components/player-status/PlayerStatusIndicator";

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
  const { calculateDevelopmentValue } = usePlayerSorting();

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-500';
      case 'B': return 'bg-blue-500';
      case 'C': return 'bg-orange-500';
      case 'D': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getPlayerWinRate = (player: Player) => {
    if (!activities.length) return 0;
    
    const playerMatches = activities.filter(activity => 
      activity.type === "match" && 
      activity.participants?.includes(player.id)
    );
    
    if (playerMatches.length === 0) return 0;
    
    const stats = calculatePlayerStats(player, playerMatches);
    return stats.winRate;
  };

  const getPlayerGoalsPerMatch = (player: Player) => {
    if (!activities.length) return 0;
    
    const playerMatches = activities.filter(activity => 
      activity.type === "match" && 
      activity.participants?.includes(player.id)
    );
    
    if (playerMatches.length === 0) return 0;
    
    const stats = calculatePlayerStats(player, playerMatches);
    return stats.matches > 0 ? Number((stats.totalGoals / stats.matches).toFixed(2)) : 0;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                className="h-auto p-0 font-semibold justify-start"
                onClick={() => toggleSort('name')}
              >
                Spelare
                <SortIcon field="name" sortField={sortField} sortDirection={sortDirection} />
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                className="h-auto p-0 font-semibold justify-start"
                onClick={() => toggleSort('grade')}
              >
                Nivå
                <SortIcon field="grade" sortField={sortField} sortDirection={sortDirection} />
              </Button>
            </TableHead>
            <TableHead>Position</TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                className="h-auto p-0 font-semibold justify-start"
                onClick={() => toggleSort('activities')}
              >
                Aktiviteter
                <SortIcon field="activities" sortField={sortField} sortDirection={sortDirection} />
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                className="h-auto p-0 font-semibold justify-start"
                onClick={() => toggleSort('winrate')}
              >
                Vinstprocent
                <SortIcon field="winrate" sortField={sortField} sortDirection={sortDirection} />
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                className="h-auto p-0 font-semibold justify-start"
                onClick={() => toggleSort('goalsPerMatch')}
              >
                Mål/match
                <SortIcon field="goalsPerMatch" sortField={sortField} sortDirection={sortDirection} />
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                className="h-auto p-0 font-semibold justify-start"
                onClick={() => toggleSort('development')}
              >
                Utveckling
                <SortIcon field="development" sortField={sortField} sortDirection={sortDirection} />
              </Button>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Åtgärder</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => {
            const isCoach = isTrainer(player.positions);
            const winRate = getPlayerWinRate(player);
            const goalsPerMatch = getPlayerGoalsPerMatch(player);
            const developmentValue = calculateDevelopmentValue(player);
            const isActive = player.isActive !== undefined ? player.isActive : true;
            
            return (
              <TableRow 
                key={player.id} 
                className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                  !isActive ? 'opacity-60 bg-gray-50/50' : ''
                }`}
                onClick={() => onPlayerSelect(player)}
              >
                <TableCell>
                  <div className={!isActive ? 'grayscale opacity-70' : ''}>
                    {player.image ? (
                      <img 
                        src={player.image} 
                        alt={player.name} 
                        className="h-10 w-10 rounded-full object-cover"
                        loading="lazy"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <UserCircle className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div>
                      <div className={`font-medium ${!isActive ? 'text-gray-500' : ''}`}>
                        {player.name}
                      </div>
                      {player.jerseyNumber && !isCoach && (
                        <div className={`text-xs ${!isActive ? 'text-gray-400' : 'text-muted-foreground'}`}>
                          #{player.jerseyNumber}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {isCoach ? (
                    <Badge className={`${
                      !isActive ? 'bg-gray-400 hover:bg-gray-500' : 'bg-amber-500 hover:bg-amber-600'
                    }`}>
                      Tränare
                    </Badge>
                  ) : (
                    <Badge className={`${
                      !isActive ? 'bg-gray-400 hover:bg-gray-500' : getGradeColor(player.grade || '')
                    }`}>
                      {player.grade}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`text-sm ${!isActive ? 'text-gray-400' : 'text-muted-foreground'}`}>
                    {!isCoach && player.positions ? formatPositions(player.positions, true) : '-'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`text-sm ${!isActive ? 'text-gray-400' : 'text-muted-foreground'}`}>
                    {player.activities?.length || 0}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`text-sm font-medium ${!isActive ? 'text-gray-400' : 'text-muted-foreground'}`}>
                    {!isCoach && winRate > 0 ? `${winRate}%` : '-'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`text-sm font-medium ${!isActive ? 'text-gray-400' : 'text-muted-foreground'}`}>
                    {!isCoach && goalsPerMatch > 0 ? goalsPerMatch.toFixed(2) : '-'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`text-sm font-bold ${
                    !isActive ? 'text-gray-400' : 
                    developmentValue >= 7 ? 'text-green-600' :
                    developmentValue >= 5 ? 'text-blue-600' :
                    developmentValue >= 3 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {!isCoach ? developmentValue.toFixed(1) : '-'}
                  </span>
                </TableCell>
                <TableCell>
                  <PlayerStatusIndicator player={player} size="sm" />
                </TableCell>
                <TableCell>
                  {onPlayerEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayerEdit(player);
                      }}
                      disabled={!isActive}
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
