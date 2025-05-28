
import React from "react";
import { Player, Activity } from "@/types/player";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { calculatePlayerStats } from "@/components/player-match-history/utils/stats-calculator";

interface PlayerGridViewProps {
  players: Player[];
  activities?: Activity[];
  onPlayerSelect: (player: Player) => void;
  onPlayerEdit?: (player: Player) => void;
}

export function PlayerGridView({ 
  players, 
  activities = [],
  onPlayerSelect, 
  onPlayerEdit 
}: PlayerGridViewProps) {
  const getWinRatio = (player: Player): number => {
    const playerMatches = activities.filter(activity => 
      activity.type === "match" && activity.participants?.includes(player.id)
    );
    const stats = calculatePlayerStats(player, playerMatches);
    return stats.matches > 0 ? Math.round((stats.wins / stats.matches) * 100) : 0;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {players.map((player) => {
        const winRatio = getWinRatio(player);
        
        return (
          <Card 
            key={player.id} 
            className="hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => onPlayerSelect(player)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={player.image} alt={player.name} />
                  <AvatarFallback>
                    <UserRound className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                {onPlayerEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayerEdit(player);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium truncate">{player.name}</h3>
                
                {player.jerseyNumber && (
                  <p className="text-sm text-muted-foreground">#{player.jerseyNumber}</p>
                )}
                
                <div className="flex flex-wrap gap-1">
                  {player.grade && (
                    <Badge variant="outline" className="text-xs">{player.grade}</Badge>
                  )}
                  {player.positions?.slice(0, 2).map(position => (
                    <Badge key={position} variant="secondary" className="text-xs">
                      {position}
                    </Badge>
                  ))}
                </div>
                
                <div className="pt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Aktiviteter:</span>
                    <span>{player.activities?.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Vinstratio:</span>
                    <span className="font-medium text-green-600">{winRatio}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
