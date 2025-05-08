
import React from "react";
import { Player, PlayerGrade, PlayerPosition } from "@/types/player";
import { PlayerList } from "@/components/player-ui/PlayerList";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { PlayerGridView } from "@/components/player-list/PlayerGridView";
import { Card } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
    return (
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Namn</TableHead>
                <TableHead>Nivå</TableHead>
                <TableHead>Aktiviteter</TableHead>
                <TableHead className="text-right">Åtgärder</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPlayers.map((player) => (
                <TableRow 
                  key={player.id} 
                  className="cursor-pointer" 
                  onClick={() => onPlayerSelect(player)}
                >
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {player.jerseyNumber && !player.positions?.includes("TRÄNARE") && (
                        <span className="text-xs bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded-full">
                          #{player.jerseyNumber}
                        </span>
                      )}
                      <span className="font-medium">{player.name}</span>
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
                  <TableCell className="text-right">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
