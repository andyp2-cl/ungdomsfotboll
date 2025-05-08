
import React from "react";
import { Player, PlayerGrade, PlayerPosition } from "@/types/player";
import { PlayerList } from "@/components/player-ui/PlayerList";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { PlayerGridView } from "@/components/player-list/PlayerGridView";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

interface PlayersListContentProps {
  filteredPlayers: Player[];
  viewMode: "grid" | "list";
  selectedPositions: PlayerPosition[];
  onPlayerSelect: (player: Player | null) => void;
  onPlayerEdit: (player: Player) => void;
  isMobile: boolean;
}

export function PlayersListContent({
  filteredPlayers,
  viewMode,
  selectedPositions,
  onPlayerSelect,
  onPlayerEdit,
  isMobile,
}: PlayersListContentProps) {
  // Sort players by grade and then by name
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    // Sort coaches to the end
    const aIsCoach = a.positions?.includes("TRÄNARE") || false;
    const bIsCoach = b.positions?.includes("TRÄNARE") || false;
    
    if (aIsCoach && !bIsCoach) return 1;
    if (!aIsCoach && bIsCoach) return -1;
    
    // Sort by grade, placing undefined grades at the end
    if (a.grade && b.grade) {
      if (a.grade !== b.grade) {
        return a.grade.localeCompare(b.grade);
      }
    }
    
    // Sort by name as a tiebreaker
    return a.name.localeCompare(b.name);
  });

  // Using a more table-oriented approach for the "list" view
  if (viewMode === "list") {
    const columns: ColumnDef<Player>[] = [
      {
        accessorKey: "name",
        header: "Namn",
        cell: ({ row }) => {
          const player = row.original;
          return (
            <div className="flex items-center space-x-2">
              {player.jerseyNumber && !player.positions?.includes("TRÄNARE") && (
                <span className="text-xs bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded-full">
                  #{player.jerseyNumber}
                </span>
              )}
              <span className="font-medium">{player.name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "grade",
        header: "Nivå",
        cell: ({ row }) => {
          const player = row.original;
          if (player.positions?.includes("TRÄNARE")) {
            return <Badge variant="outline" className="border-amber-300 text-amber-700">Tränare</Badge>;
          }
          return player.grade ? <Badge variant="outline">{player.grade}</Badge> : null;
        },
      },
      {
        accessorKey: "activities",
        header: "Aktiviteter",
        cell: ({ row }) => {
          const player = row.original;
          const activityCount = player.activities?.length || 0;
          return (
            <span className="text-sm text-muted-foreground">
              {activityCount} aktiviteter
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Åtgärder",
        cell: ({ row }) => {
          const player = row.original;
          return (
            <div className="flex justify-end">
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
            </div>
          );
        },
      },
    ];

    return (
      <Card className="overflow-hidden">
        <DataTable
          columns={columns}
          data={sortedPlayers}
          onRowClick={(player) => onPlayerSelect(player)}
        />
      </Card>
    );
  }

  return (
    <PlayerList
      players={sortedPlayers}
      onPlayerSelect={onPlayerSelect}
      onPlayerEdit={onPlayerEdit}
      compact={isMobile}
      showStats={true}
    />
  );
}
