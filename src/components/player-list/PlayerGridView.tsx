
import React from "react";
import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Edit, UserCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getPositionsString } from "./PlayerFormatting";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface PlayerGridViewProps {
  players: Player[];
  onPlayerSelect: (player: Player) => void;
  onPlayerEdit?: (player: Player) => void;
}

export function PlayerGridView({ players, onPlayerSelect, onPlayerEdit }: PlayerGridViewProps) {
  const isMobile = useIsMobile();
  
  if (players.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">Inga spelare hittades</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {players.map((player) => {
        const playerName = player.name || "Unnamed Player";
        
        return (
          <div 
            key={player.id} 
            className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="flex items-center p-4">
              <Avatar className="h-12 w-12 mr-3">
                {player.image ? (
                  <AvatarImage 
                    src={player.image} 
                    alt={playerName}
                    crossOrigin="anonymous"
                    loading="lazy"
                  />
                ) : (
                  <AvatarFallback>
                    <UserCircle className="h-6 w-6 text-muted-foreground" />
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div 
                onClick={() => onPlayerSelect(player)} 
                className="flex-1 cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{playerName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {getPositionsString(player.positions)}
                    </p>
                  </div>
                  {player.grade && (
                    <Badge 
                      className={`px-2.5 py-1 ${
                        player.grade === 'A' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                        player.grade === 'B' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                        player.grade === 'C' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' :
                        'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {player.grade}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {onPlayerEdit && (
              <div className="border-t p-3 bg-muted/30">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onPlayerEdit(player)}
                  className={isMobile ? "w-full py-3 h-auto min-h-[44px]" : ""}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Redigera
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
