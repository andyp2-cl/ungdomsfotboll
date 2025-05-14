
import React from "react";
import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getPositionsString } from "./PlayerFormatting";
import { useIsMobile } from "@/hooks/use-mobile";
import { DevelopmentChart } from "@/components/player-detail/DevelopmentChart";

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
    <div className="space-y-2">
      {players.map((player) => {
        const playerName = player.name || "Unnamed Player";
        
        return (
          <div 
            key={player.id} 
            className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow flex"
          >
            <div 
              className="w-16 h-16 bg-muted flex-shrink-0"
            >
              {player.image ? (
                <img 
                  src={player.image} 
                  alt={playerName} 
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-muted">
                  <span className="text-lg font-medium text-muted-foreground">
                    {playerName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            
            <div 
              onClick={() => onPlayerSelect(player)} 
              className="cursor-pointer p-3 flex-grow flex items-center justify-between"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium">{playerName}</h3>
                  {player.jerseyNumber && !player.positions?.includes("TRÄNARE") && (
                    <span className="text-xs bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded-full">
                      #{player.jerseyNumber}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {getPositionsString(player.positions)}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                {player.grade && !player.positions?.includes("TRÄNARE") && (
                  <Badge 
                    className={`px-2.5 py-1 ${
                      player.grade === 'A' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                      player.grade === 'B' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                      player.grade === 'C' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' :
                      'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    Nivå {player.grade}
                  </Badge>
                )}
                
                {player.positions?.includes("TRÄNARE") && (
                  <Badge 
                    className="bg-amber-100 text-amber-800 hover:bg-amber-200"
                  >
                    Tränare
                  </Badge>
                )}
                
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {player.activities?.length || 0} aktiviteter
                </span>
              </div>
              
              {player.development && (
                <div className="hidden sm:block h-12 w-12">
                  <DevelopmentChart development={player.development} minimal={true} />
                </div>
              )}
            </div>
            
            {onPlayerEdit && (
              <div className="border-l p-3 flex items-center bg-muted/30">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayerEdit(player);
                  }}
                  className={isMobile ? "w-full py-1 h-auto" : ""}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
