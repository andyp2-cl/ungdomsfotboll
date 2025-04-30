
import React from "react";
import { Player } from "@/types/player";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { SortIcon, SortField } from "./PlayerListSorting";
import { Badge } from "@/components/ui/badge";

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
  // Function to format positions for display
  const formatPositions = (positions: string[] | undefined) => {
    if (!positions || positions.length === 0) return "-";
    
    // Filter out TRÄNARE if it exists
    const filteredPositions = positions.filter(pos => pos !== "TRÄNARE");
    
    if (filteredPositions.length === 0) {
      return "Tränare";
    }
    
    return filteredPositions.join(", ");
  };

  // Function to count activities for a player
  const getActivityCount = (player: Player) => {
    return player.activities?.length || 0;
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer"
              onClick={() => toggleSort('name')}
            >
              Namn
              <SortIcon field="name" sortField={sortField} sortDirection={sortDirection} />
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => toggleSort('position')}
            >
              Position
              <SortIcon field="position" sortField={sortField} sortDirection={sortDirection} />
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => toggleSort('grade')}
            >
              Nivå
              <SortIcon field="grade" sortField={sortField} sortDirection={sortDirection} />
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => toggleSort('activities')}
            >
              Aktiviteter
              <SortIcon field="activities" sortField={sortField} sortDirection={sortDirection} />
            </TableHead>
            <TableHead className="text-right">Åtgärder</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map(player => (
            <TableRow 
              key={player.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onPlayerSelect(player)}
            >
              <TableCell className="font-medium">{player.name}</TableCell>
              <TableCell>{formatPositions(player.positions)}</TableCell>
              <TableCell>
                {player.positions?.includes("TRÄNARE") ? (
                  <Badge variant="outline" className="border-amber-300 text-amber-700">
                    Tränare
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    Nivå {player.grade || "-"}
                  </Badge>
                )}
              </TableCell>
              <TableCell>{getActivityCount(player)}</TableCell>
              <TableCell className="text-right">
                {onPlayerEdit && (
                  <button 
                    className="text-sm text-blue-600 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayerEdit(player);
                    }}
                  >
                    Redigera
                  </button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
