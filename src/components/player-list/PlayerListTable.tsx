
import React from "react";
import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Edit, UserCircle } from "lucide-react";
import { SortField, SortIcon } from "./PlayerListSorting";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlayerAvatar } from "@/components/player-selection/PlayerAvatar";
import { DevelopmentChart } from "../player-detail/DevelopmentChart";

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
  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer"
                onClick={() => toggleSort('name')}
              >
                Namn <SortIcon field="name" sortField={sortField} sortDirection={sortDirection} />
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => toggleSort('grade')}
              >
                Nivå <SortIcon field="grade" sortField={sortField} sortDirection={sortDirection} />
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => toggleSort('activities')}
              >
                Aktiviteter <SortIcon field="activities" sortField={sortField} sortDirection={sortDirection} />
              </TableHead>
              <TableHead>Utveckling</TableHead>
              <TableHead className="text-right">Åtgärder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player) => (
              <TableRow 
                key={player.id} 
                className="cursor-pointer"
                onClick={() => onPlayerSelect(player)}
              >
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="h-14 w-14 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                      {player.image ? (
                        <img 
                          src={player.image} 
                          alt={player.name} 
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <UserCircle className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {player.jerseyNumber && !player.positions?.includes("TRÄNARE") && (
                        <span className="text-xs bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded-full">
                          #{player.jerseyNumber}
                        </span>
                      )}
                      <span className="font-medium">{player.name}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {player.positions?.includes("TRÄNARE") ? (
                    <Badge variant="outline" className="border-amber-300 text-amber-700">Tränare</Badge>
                  ) : player.grade ? (
                    <Badge variant="outline">{player.grade}</Badge>
                  ) : null}
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {player.activities?.length || 0} aktiviteter
                  </span>
                </TableCell>
                <TableCell>
                  <div className="h-20 w-20">
                    <DevelopmentChart development={player.development} minimal={true} />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {onPlayerEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
