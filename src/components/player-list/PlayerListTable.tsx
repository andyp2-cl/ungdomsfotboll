import React, { useState } from "react";
import { Player, Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SortField, SortIcon, usePlayerSorting } from "./PlayerListSorting";
import { calculatePlayerStats } from "@/components/player-match-history/utils/stats-calculator";
import { formatPositions, isTrainer } from "@/utils/positionUtils";
import { PlayerFormDisplay } from "./PlayerFormDisplay";
import { calculateUniqueTeammates } from "@/utils/playerStatistics";
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Settings2 } from "lucide-react";

interface Column {
  id: SortField;
  label: string;
  width?: number;
  alwaysShow?: boolean;
  render: (player: Player, activities: Activity[]) => React.ReactNode;
}

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
  const [visibleColumns, setVisibleColumns] = useState<SortField[]>([
    'name',
    'grade',
    'position',
    'activities',
    'winrate',
    'goalsPerMatch',
    'teammates',
    'development',
    'form'
  ]);

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

  const columns: Column[] = [
    {
      id: 'name',
      label: 'Spelare',
      alwaysShow: true,
      render: (player) => (
        <div className="flex items-center gap-2">
          <div className={!player.isActive ? 'grayscale opacity-70' : ''}>
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
          <div>
            <div className={`font-medium ${!player.isActive ? 'text-gray-500' : ''}`}>
              {player.name}
            </div>
            {player.jerseyNumber && !isTrainer(player.positions) && (
              <div className={`text-xs ${!player.isActive ? 'text-gray-400' : 'text-muted-foreground'}`}>
                #{player.jerseyNumber}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'grade',
      label: 'Nivå',
      render: (player) => {
        const isCoach = isTrainer(player.positions);
        return isCoach ? (
          <Badge className={`${
            !player.isActive ? 'bg-gray-400 hover:bg-gray-500' : 'bg-amber-500 hover:bg-amber-600'
          }`}>
            Tränare
          </Badge>
        ) : (
          <Badge className={`${
            !player.isActive ? 'bg-gray-400 hover:bg-gray-500' : getGradeColor(player.grade || '')
          }`}>
            {player.grade}
          </Badge>
        );
      }
    },
    {
      id: 'position',
      label: 'Position',
      render: (player) => {
        const isCoach = isTrainer(player.positions);
        return (
          <span className={`text-sm ${!player.isActive ? 'text-gray-400' : 'text-muted-foreground'}`}>
            {!isCoach && player.positions ? formatPositions(player.positions, true) : '-'}
          </span>
        );
      }
    },
    {
      id: 'activities',
      label: 'Aktiviteter',
      render: (player) => (
        <span className={`text-sm ${!player.isActive ? 'text-gray-400' : 'text-muted-foreground'}`}>
          {player.activities?.length || 0}
        </span>
      )
    },
    {
      id: 'winrate',
      label: 'Vinstprocent',
      render: (player) => {
        const isCoach = isTrainer(player.positions);
        const winRate = getPlayerWinRate(player);
        return (
          <span className={`text-sm font-medium ${!player.isActive ? 'text-gray-400' : 'text-muted-foreground'}`}>
            {!isCoach && winRate > 0 ? `${winRate}%` : '-'}
          </span>
        );
      }
    },
    {
      id: 'goalsPerMatch',
      label: 'Mål/match',
      render: (player) => {
        const isCoach = isTrainer(player.positions);
        const goalsPerMatch = getPlayerGoalsPerMatch(player);
        return (
          <span className={`text-sm font-medium ${!player.isActive ? 'text-gray-400' : 'text-muted-foreground'}`}>
            {!isCoach && goalsPerMatch > 0 ? goalsPerMatch.toFixed(2) : '-'}
          </span>
        );
      }
    },
    {
      id: 'teammates',
      label: 'Medspelare',
      render: (player) => {
        const isCoach = isTrainer(player.positions);
        const uniqueTeammates = calculateUniqueTeammates(player.id, activities);
        return (
          <span className={`text-sm font-medium ${!player.isActive ? 'text-gray-400' : 'text-muted-foreground'}`}>
            {!isCoach ? uniqueTeammates : '-'}
          </span>
        );
      }
    },
    {
      id: 'development',
      label: 'Utveckling',
      render: (player) => {
        const isCoach = isTrainer(player.positions);
        const developmentValue = calculateDevelopmentValue(player);
        return (
          <span className={`text-sm font-bold ${
            !player.isActive ? 'text-gray-400' : 
            developmentValue >= 7 ? 'text-green-600' :
            developmentValue >= 5 ? 'text-blue-600' :
            developmentValue >= 3 ? 'text-orange-600' : 'text-red-600'
          }`}>
            {!isCoach ? developmentValue.toFixed(1) : '-'}
          </span>
        );
      }
    },
    {
      id: 'form',
      label: 'Form',
      render: (player) => (
        <PlayerFormDisplay player={player} activities={activities} />
      )
    }
  ];

  const visibleColumnsList = columns.filter(col => 
    col.alwaysShow || visibleColumns.includes(col.id)
  );

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings2 className="h-4 w-4 mr-2" />
              Kolumner
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {columns.map((column) => (
              !column.alwaysShow && (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={visibleColumns.includes(column.id)}
                  onCheckedChange={(checked) => {
                    setVisibleColumns(prev => 
                      checked 
                        ? [...prev, column.id]
                        : prev.filter(id => id !== column.id)
                    );
                  }}
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              )
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumnsList.map((column) => (
                <TableHead key={column.id}>
                  {column.id === 'name' || !column.alwaysShow ? (
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 font-semibold justify-start"
                      onClick={() => toggleSort(column.id)}
                    >
                      {column.label}
                      <SortIcon field={column.id} sortField={sortField} sortDirection={sortDirection} />
                    </Button>
                  ) : (
                    column.label
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player) => {
              const isActive = player.isActive !== undefined ? player.isActive : true;
              
              return (
                <TableRow 
                  key={player.id} 
                  className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                    !isActive ? 'opacity-60 bg-gray-50/50' : ''
                  }`}
                  onClick={() => onPlayerSelect(player)}
                >
                  {visibleColumnsList.map((column) => (
                    <TableCell key={`${player.id}-${column.id}`}>
                      {column.render(player, activities)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
