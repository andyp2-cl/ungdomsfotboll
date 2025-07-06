import React, { useCallback, useMemo } from "react";
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

interface PlayerListTableProps {
  players: Player[];
  activities?: Activity[];
  sortField: SortField;
  sortDirection: 'asc' | 'desc';
  toggleSort: (field: SortField) => void;
  onPlayerSelect: (player: Player) => void;
  onPlayerEdit?: (player: Player) => void;
  visibleColumns?: string[];
}

// Memoized table row component to prevent unnecessary re-renders
const PlayerTableRow = React.memo<{
  player: Player;
  activities: Activity[];
  visibleColumnIds: string[];
  onPlayerSelect: (player: Player) => void;
  calculateDevelopmentValue: (player: Player) => number;
  getPlayerWinRate: (player: Player) => number;
  getPlayerGoalsPerMatch: (player: Player) => number;
}>(({ 
  player, 
  activities, 
  visibleColumnIds, 
  onPlayerSelect, 
  calculateDevelopmentValue,
  getPlayerWinRate,
  getPlayerGoalsPerMatch
}) => {
  const isCoach = isTrainer(player.positions);
  const winRate = getPlayerWinRate(player);
  const goalsPerMatch = getPlayerGoalsPerMatch(player);
  const developmentValue = calculateDevelopmentValue(player);
  const isActive = player.isActive !== undefined ? player.isActive : true;
  const uniqueTeammates = calculateUniqueTeammates(player.id, activities);

  const handleRowClick = useCallback(() => {
    onPlayerSelect(player);
  }, [onPlayerSelect, player]);

  const getGradeColor = useCallback((grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-500';
      case 'B': return 'bg-blue-500';
      case 'C': return 'bg-orange-500';
      case 'D': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  }, []);

  return (
    <TableRow 
      className={`cursor-pointer hover:bg-muted/50 transition-colors ${
        !isActive ? 'opacity-60 bg-gray-50/50' : ''
      }`}
      onClick={handleRowClick}
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

      {/* Name column - always visible */}
      {visibleColumnIds.includes('name') && (
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
      )}

      {/* Grade column */}
      {visibleColumnIds.includes('grade') && (
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
      )}

      {/* Position column */}
      {visibleColumnIds.includes('position') && (
        <TableCell>
          <span className={`text-sm ${!isActive ? 'text-gray-400' : 'text-muted-foreground'}`}>
            {!isCoach && player.positions ? formatPositions(player.positions, true) : '-'}
          </span>
        </TableCell>
      )}

      {/* Activities column */}
      {visibleColumnIds.includes('activities') && (
        <TableCell>
          <span className={`text-sm ${!isActive ? 'text-gray-400' : 'text-muted-foreground'}`}>
            {player.activities?.length || 0}
          </span>
        </TableCell>
      )}

      {/* Teammates column */}
      {visibleColumnIds.includes('teammates') && (
        <TableCell>
          <span className={`text-sm ${!isActive ? 'text-gray-400' : 'text-muted-foreground'}`}>
            {uniqueTeammates}
          </span>
        </TableCell>
      )}

      {/* Winrate column */}
      {visibleColumnIds.includes('winrate') && (
        <TableCell>
          <span className={`text-sm ${!isActive ? 'text-gray-400' : 'text-muted-foreground'}`}>
            {winRate}%
          </span>
        </TableCell>
      )}

      {/* Goals per match column */}
      {visibleColumnIds.includes('goalsPerMatch') && (
        <TableCell>
          <span className={`text-sm ${!isActive ? 'text-gray-400' : 'text-muted-foreground'}`}>
            {goalsPerMatch}
          </span>
        </TableCell>
      )}

      {/* Development column */}
      {visibleColumnIds.includes('development') && (
        <TableCell>
          <span className={`text-sm ${!isActive ? 'text-gray-400' : 'text-muted-foreground'}`}>
            {developmentValue.toFixed(1)}
          </span>
        </TableCell>
      )}

      {/* Form column */}
      {visibleColumnIds.includes('form') && (
        <TableCell>
          <PlayerFormDisplay 
            playerId={player.id}
            activities={activities}
          />
        </TableCell>
      )}
    </TableRow>
  );
});

PlayerTableRow.displayName = 'PlayerTableRow';

export const PlayerListTable = React.memo<PlayerListTableProps>(({ 
  players, 
  activities = [],
  sortField, 
  sortDirection, 
  toggleSort, 
  onPlayerSelect, 
  onPlayerEdit,
  visibleColumns = ['name', 'grade', 'position', 'activities', 'winrate', 'goalsPerMatch', 'development', 'form']
}) => {
  const { calculateDevelopmentValue } = usePlayerSorting();

  // Memoize expensive calculations
  const getPlayerWinRate = useCallback((player: Player) => {
    if (!activities.length) return 0;
    
    const playerMatches = activities.filter(activity => 
      activity.type === "match" && 
      activity.participants?.includes(player.id)
    );
    
    if (playerMatches.length === 0) return 0;
    
    const stats = calculatePlayerStats(player, playerMatches);
    return stats.winRate;
  }, [activities]);

  const getPlayerGoalsPerMatch = useCallback((player: Player) => {
    if (!activities.length) return 0;
    
    const playerMatches = activities.filter(activity => 
      activity.type === "match" && 
      activity.participants?.includes(player.id)
    );
    
    if (playerMatches.length === 0) return 0;
    
    const stats = calculatePlayerStats(player, playerMatches);
    return stats.matches > 0 ? Number((stats.totalGoals / stats.matches).toFixed(2)) : 0;
  }, [activities]);

  // Memoize columns configuration
  const columns = useMemo(() => [
    { id: 'name', label: 'Spelare', width: 'auto', alwaysVisible: true },
    { id: 'grade', label: 'Nivå', width: 'auto' },
    { id: 'position', label: 'Position', width: 'auto' },
    { id: 'activities', label: 'Aktiviteter', width: 'auto' },
    { id: 'teammates', label: 'Medspelare', width: 'auto' },
    { id: 'winrate', label: 'Vinstprocent', width: 'auto' },
    { id: 'goalsPerMatch', label: 'Mål/match', width: 'auto' },
    { id: 'development', label: 'Utveckling', width: 'auto' },
    { id: 'form', label: 'Form', width: 'auto' }
  ], []);

  const visibleColumnIds = useMemo(() => 
    columns
      .filter(col => col.alwaysVisible || visibleColumns.includes(col.id))
      .map(col => col.id),
    [columns, visibleColumns]
  );

  const handleSortClick = useCallback((field: SortField) => {
    toggleSort(field);
  }, [toggleSort]);

  const handlePlayerSelect = useCallback((player: Player) => {
    onPlayerSelect(player);
  }, [onPlayerSelect]);

  return (
    <div className="rounded-md border overflow-x-auto max-w-full">
      <Table style={{ tableLayout: 'fixed', width: '100%' }}>
        <colgroup>
          <col style={{ width: 80 }} /> {/* Bildkolumn */}
          {visibleColumnIds.map((colId) => (
            <col key={colId} style={{ width: columns.find(c => c.id === colId)?.width }} />
          ))}
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            {columns.map((column) => (
              (column.alwaysVisible || visibleColumns.includes(column.id)) && (
                <TableHead key={column.id}>
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-semibold justify-start"
                    onClick={() => handleSortClick(column.id as SortField)}
                  >
                    {column.label}
                    <SortIcon field={column.id as SortField} sortField={sortField} sortDirection={sortDirection} />
                  </Button>
                </TableHead>
              )
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => (
            <PlayerTableRow
              key={player.id}
              player={player}
              activities={activities}
              visibleColumnIds={visibleColumnIds}
              onPlayerSelect={handlePlayerSelect}
              calculateDevelopmentValue={calculateDevelopmentValue}
              getPlayerWinRate={getPlayerWinRate}
              getPlayerGoalsPerMatch={getPlayerGoalsPerMatch}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

PlayerListTable.displayName = 'PlayerListTable';
