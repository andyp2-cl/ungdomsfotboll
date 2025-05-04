
import React from "react";
import { Player } from "@/types/player";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, UserCircle } from "lucide-react";
import { SortField, SortIcon } from "./PlayerListSorting";
import { usePlayerFormatting } from "./PlayerFormatting";

interface PlayerListTableProps {
  players: Player[];
  sortField: SortField;
  sortDirection: 'asc' | 'desc';
  toggleSort: (field: SortField) => void;
  onPlayerSelect: (player: Player) => void;
  onPlayerEdit?: (player: Player) => void;
}

export function PlayerListTable({
  players,
  sortField,
  sortDirection,
  toggleSort,
  onPlayerSelect,
  onPlayerEdit
}: PlayerListTableProps) {
  const { getGradeColor, getGradeText } = usePlayerFormatting();

  const handleEditClick = (e: React.MouseEvent, player: Player) => {
    e.stopPropagation();
    if (onPlayerEdit) {
      onPlayerEdit(player);
    }
  };

  if (players.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Inga spelare hittades</p>
      </div>
    );
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead onClick={() => toggleSort('name')} className="cursor-pointer hover:bg-muted/50">
            Namn <SortIcon field="name" sortField={sortField} sortDirection={sortDirection} />
          </TableHead>
          <TableHead onClick={() => toggleSort('grade')} className="cursor-pointer hover:bg-muted/50">
            Nivå <SortIcon field="grade" sortField={sortField} sortDirection={sortDirection} />
          </TableHead>
          {onPlayerEdit && <TableHead className="w-16">Åtgärder</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((player) => (
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
