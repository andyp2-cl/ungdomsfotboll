
import React from 'react';
import { Player } from '@/types/player';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type SortField = 'name' | 'grade' | 'position' | 'jerseyNumber';

export interface PlayerListTableProps {
  players: Player[];
  onPlayerSelect: (player: Player) => void;
  onPlayerEdit: (player: Player) => void;
  sortField: SortField;  
  sortDirection: 'asc' | 'desc';
  toggleSort: (field: SortField) => void;
}

export function PlayerListTable({ 
  players, 
  onPlayerSelect, 
  onPlayerEdit,
  sortField,
  sortDirection,
  toggleSort
}: PlayerListTableProps) {
  const SortIcon = sortDirection === 'asc' ? ChevronUp : ChevronDown;
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => toggleSort('name')} className="cursor-pointer">
              <div className="flex items-center">
                Namn
                {sortField === 'name' && <SortIcon className="ml-2 h-4 w-4" />}
              </div>
            </TableHead>
            <TableHead onClick={() => toggleSort('grade')} className="cursor-pointer w-20">
              <div className="flex items-center">
                Grad
                {sortField === 'grade' && <SortIcon className="ml-2 h-4 w-4" />}
              </div>
            </TableHead>
            <TableHead onClick={() => toggleSort('position')} className="cursor-pointer hidden md:table-cell">
              <div className="flex items-center">
                Position
                {sortField === 'position' && <SortIcon className="ml-2 h-4 w-4" />}
              </div>
            </TableHead>
            <TableHead onClick={() => toggleSort('jerseyNumber')} className="cursor-pointer w-24 hidden md:table-cell">
              <div className="flex items-center">
                Tröja
                {sortField === 'jerseyNumber' && <SortIcon className="ml-2 h-4 w-4" />}
              </div>
            </TableHead>
            <TableHead className="w-24 text-right">Åtgärder</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => (
            <TableRow 
              key={player.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onPlayerSelect(player)}
            >
              <TableCell className="font-medium">{player.name}</TableCell>
              <TableCell>{player.grade}</TableCell>
              <TableCell className="hidden md:table-cell">
                {player.positions && player.positions.length > 0 ? player.positions[0] : 'N/A'}
              </TableCell>
              <TableCell className="hidden md:table-cell">{player.jerseyNumber || '-'}</TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayerEdit(player);
                  }}
                >
                  Redigera
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
