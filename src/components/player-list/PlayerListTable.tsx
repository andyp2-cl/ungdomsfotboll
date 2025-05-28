
import React from "react";
import { Player, Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SortField, SortIcon } from "./PlayerListSorting";
import { calculatePlayerStats } from "@/components/player-match-history/utils/stats-calculator";

interface PlayerListTableProps {
  players: Player[];
  activities: Activity[];
  sortField: SortField;
  sortDirection: "asc" | "desc";
  toggleSort: (field: SortField) => void;
  onPlayerSelect: (player: Player) => void;
  onPlayerEdit?: (player: Player) => void;
}

export function PlayerListTable({
  players,
  activities,
  sortField,
  sortDirection,
  toggleSort,
  onPlayerSelect,
  onPlayerEdit
}: PlayerListTableProps) {
  const getWinRatio = (player: Player): number => {
    const playerMatches = activities.filter(activity => 
      activity.type === "match" && activity.participants?.includes(player.id)
    );
    const stats = calculatePlayerStats(player, playerMatches);
    return stats.matches > 0 ? Math.round((stats.wins / stats.matches) * 100) : 0;
  };

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium">
                <Button
                  variant="ghost"
                  onClick={() => toggleSort('name')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Namn
                  <SortIcon field="name" sortField={sortField} sortDirection={sortDirection} />
                </Button>
              </th>
              <th className="text-left p-4 font-medium">
                <Button
                  variant="ghost"
                  onClick={() => toggleSort('grade')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Nivå
                  <SortIcon field="grade" sortField={sortField} sortDirection={sortDirection} />
                </Button>
              </th>
              <th className="text-left p-4 font-medium">
                <Button
                  variant="ghost"
                  onClick={() => toggleSort('position')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Position
                  <SortIcon field="position" sortField={sortField} sortDirection={sortDirection} />
                </Button>
              </th>
              <th className="text-left p-4 font-medium">
                <Button
                  variant="ghost"
                  onClick={() => toggleSort('activities')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Aktiviteter
                  <SortIcon field="activities" sortField={sortField} sortDirection={sortDirection} />
                </Button>
              </th>
              <th className="text-left p-4 font-medium">
                <Button
                  variant="ghost"
                  onClick={() => toggleSort('winRatio')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Vinstratio
                  <SortIcon field="winRatio" sortField={sortField} sortDirection={sortDirection} />
                </Button>
              </th>
              <th className="text-right p-4 font-medium">Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => {
              const winRatio = getWinRatio(player);
              
              return (
                <tr 
                  key={player.id} 
                  className="border-t hover:bg-muted/30 cursor-pointer"
                  onClick={() => onPlayerSelect(player)}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={player.image} alt={player.name} />
                        <AvatarFallback>
                          <UserRound className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{player.name}</div>
                        {player.jerseyNumber && (
                          <div className="text-sm text-muted-foreground">#{player.jerseyNumber}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {player.grade && (
                      <Badge variant="outline">{player.grade}</Badge>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {player.positions?.map(position => (
                        <Badge key={position} variant="secondary" className="text-xs">
                          {position}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm">{player.activities?.length || 0}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-medium text-green-600">{winRatio}%</span>
                  </td>
                  <td className="p-4 text-right">
                    {onPlayerEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayerEdit(player);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
