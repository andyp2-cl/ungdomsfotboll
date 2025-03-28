
import React from "react";
import { Player } from "@/types/player";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, UserCircle, ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import { PlayerCard } from "./PlayerCard";

interface PlayerListProps {
  players: Player[];
  viewMode?: "grid" | "list";
  onPlayerSelect: (player: Player) => void;
  onPlayerEdit?: (player: Player) => void;
}

type SortField = 'name' | 'position' | 'grade' | 'activities';
type SortDirection = 'asc' | 'desc';

export function PlayerList({ players, viewMode = "list", onPlayerSelect, onPlayerEdit }: PlayerListProps) {
  const [sortField, setSortField] = React.useState<SortField>('name');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('asc');

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

  const getGradeText = (grade: string) => {
    return `Nivå ${grade}`;
  };

  const formatPosition = (position: string) => {
    if (position === 'TRÄNARE') return 'Tränare';
    
    let formattedPosition = position
      .replace('MV', 'Målvakt')
      .replace('BACK', 'Back')
      .replace('MF', 'Mittfält')
      .replace('ANF', 'Anfall');
    
    return formattedPosition;
  };

  const formatPositions = (positions: string[] | undefined) => {
    if (!positions || positions.length === 0) return 'Odefinierad';
    return positions.map(formatPosition).join(', ');
  };

  const getActivityCount = (player: Player) => {
    if (!player.activities || player.activities.length === 0) return 0;
    return player.activities.length;
  };

  const handleEditClick = (e: React.MouseEvent, player: Player) => {
    e.stopPropagation();
    if (onPlayerEdit) {
      onPlayerEdit(player);
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedPlayers = [...players].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'name':
        return a.name.localeCompare(b.name) * direction;
      case 'position':
        const positionsA = a.positions ? a.positions.join(' ') : '';
        const positionsB = b.positions ? b.positions.join(' ') : '';
        return positionsA.localeCompare(positionsB) * direction;
      case 'grade':
        return a.grade.localeCompare(b.grade) * direction;
      case 'activities':
        const activitiesA = getActivityCount(a);
        const activitiesB = getActivityCount(b);
        return (activitiesA - activitiesB) * direction;
      default:
        return 0;
    }
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ArrowDownAZ className="inline ml-1 h-4 w-4" /> : 
      <ArrowUpAZ className="inline ml-1 h-4 w-4" />;
  };

  if (players.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Inga spelare hittades</p>
      </div>
    );
  }

  // Grid view
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {sortedPlayers.map(player => (
          <PlayerCard 
            key={player.id}
            player={player}
            onClick={() => onPlayerSelect(player)}
            onEdit={onPlayerEdit}
          />
        ))}
      </div>
    );
  }

  // List view (default)
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead onClick={() => toggleSort('name')} className="cursor-pointer hover:bg-muted/50">
            Namn <SortIcon field="name" />
          </TableHead>
          <TableHead onClick={() => toggleSort('position')} className="cursor-pointer hover:bg-muted/50">
            Position <SortIcon field="position" />
          </TableHead>
          <TableHead onClick={() => toggleSort('grade')} className="cursor-pointer hover:bg-muted/50">
            Nivå <SortIcon field="grade" />
          </TableHead>
          <TableHead onClick={() => toggleSort('activities')} className="cursor-pointer hover:bg-muted/50">
            Aktiviteter <SortIcon field="activities" />
          </TableHead>
          {onPlayerEdit && <TableHead className="w-16">Åtgärder</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedPlayers.map((player) => (
          <TableRow 
            key={player.id} 
            onClick={() => onPlayerSelect(player)}
            className="cursor-pointer hover:bg-muted/50"
          >
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                {player.image ? (
                  <img 
                    src={player.image} 
                    alt={player.name} 
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <UserCircle className="h-5 w-5 text-gray-400" />
                  </div>
                )}
                <span>
                  {player.name}
                  {player.jerseyNumber && (
                    <span className="ml-2 text-xs bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded-full">
                      #{player.jerseyNumber}
                    </span>
                  )}
                </span>
              </div>
            </TableCell>
            <TableCell>{formatPositions(player.positions)}</TableCell>
            <TableCell>
              {player.positions && player.positions.includes('TRÄNARE') ? (
                <Badge className="bg-gray-500 hover:bg-gray-600">
                  Tränare
                </Badge>
              ) : (
                <Badge className={getGradeColor(player.grade)}>
                  {getGradeText(player.grade)}
                </Badge>
              )}
            </TableCell>
            <TableCell>
              {getActivityCount(player) > 0 
                ? `${getActivityCount(player)} aktiviteter`
                : "Inga aktiviteter"}
            </TableCell>
            {onPlayerEdit && (
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={(e) => handleEditClick(e, player)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
