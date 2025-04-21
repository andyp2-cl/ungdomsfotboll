import React, { useState, useMemo } from "react";
import { Player } from "@/types/player";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge";

interface PlayerListTableProps {
  players: Player[];
  onPlayerSelect: (player: Player) => void;
}

interface PositionBadgeProps {
  position: string;
}

function PositionBadge({ position }: PositionBadgeProps) {
  let badgeText = position;
  let badgeColor = "bg-gray-100 text-gray-700";

  switch (position) {
    case "MV":
      badgeText = "Målvakt";
      badgeColor = "bg-blue-100 text-blue-700";
      break;
    case "BACK":
      badgeText = "Back";
      badgeColor = "bg-green-100 text-green-700";
      break;
    case "MF":
      badgeText = "Mittfältare";
      badgeColor = "bg-orange-100 text-orange-700";
      break;
    case "ANF":
      badgeText = "Anfallare";
      badgeColor = "bg-red-100 text-red-700";
      break;
    case "TRÄNARE":
      badgeText = "Tränare";
      badgeColor = "bg-amber-100 text-amber-700";
      break;
    default:
      break;
  }

  return (
    <Badge className={`${badgeColor} rounded-full`}>{badgeText}</Badge>
  );
}

export function PlayerListTable({ players, onPlayerSelect }: PlayerListTableProps) {
  const [search, setSearch] = useState("");

  const filteredPlayers = useMemo(() => {
    const lowerCaseSearch = search.toLowerCase();
    return players.filter(player =>
      player.name.toLowerCase().includes(lowerCaseSearch)
    );
  }, [search, players]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  
  return (
    <div className="rounded-md border">
      <div className="p-4">
        <Input
          type="search"
          placeholder="Sök spelare..."
          value={search}
          onChange={handleSearchChange}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Namn</TableHead>
            <TableHead className="text-center">Tröjnummer</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Nivå</TableHead>
            <TableHead>Aktiviteter</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y">
          {filteredPlayers.map(player => {
            const isCoach = player.positions?.includes('TRÄNARE');
            return (
              <TableRow 
                key={player.id}
                className={`hover:bg-muted/50 cursor-pointer ${isCoach ? 'bg-amber-50/30' : ''}`}
                onClick={() => onPlayerSelect(player)}
              >
                <TableCell className="p-2 pl-4 align-middle">{player.name}</TableCell>
                <TableCell className="p-2 align-middle text-center">
                  {player.jerseyNumber ? `#${player.jerseyNumber}` : '-'}
                </TableCell>
                <TableCell className="p-2 align-middle">
                  {isCoach ? (
                    <Badge variant="outline" className="bg-amber-100">Tränare</Badge>
                  ) : (
                    player.positions && player.positions.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {player.positions.map(pos => (
                          <PositionBadge key={pos} position={pos} />
                        ))}
                      </div>
                    ) : '-'
                  )}
                </TableCell>
                <TableCell className="p-2 align-middle">{player.grade || '-'}</TableCell>
                <TableCell className="p-2 align-middle">{player.activities?.length || 0}</TableCell>
              </TableRow>
            );
          })}
          {filteredPlayers.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center p-4">
                Inga spelare hittades.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
