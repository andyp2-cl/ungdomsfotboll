
import React from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface PlayerHeaderProps {
  player?: Player;
  onEdit?: (player: Player) => void;
  onPlayerUpdate?: (player: Player) => void;
  onBulkUpdate?: (player: Player) => void;
  allPlayers?: Player[];
}

export function PlayerHeader({ 
  player, 
  onEdit, 
  onPlayerUpdate, 
  onBulkUpdate, 
  allPlayers 
}: PlayerHeaderProps = {}) {
  const location = useLocation();
  
  // Determine which breadcrumb items to show based on the current path
  const getBreadcrumbItems = () => {
    if (location.pathname === "/players") {
      return [{ label: "Spelare" }];
    } else if (location.pathname === "/activities") {
      return [{ label: "Matcher" }];
    }
    return [];
  };
  
  // If we have a player, show player-specific header
  if (player) {
    return (
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold">{player.name}</h2>
          <p className="text-muted-foreground">Nivå: {player.grade}</p>
        </div>
        
        {onEdit && (
          <Button variant="outline" size="sm" onClick={() => onEdit(player)} className="mt-2 md:mt-0">
            <Edit className="h-4 w-4 mr-2" />
            Redigera
          </Button>
        )}
      </div>
    );
  }
  
  // Default header with breadcrumbs
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <Link to="/" className="text-4xl font-bold text-[#006633] hover:text-[#005522] transition-colors">
          HIF P2014
        </Link>
      </div>
      
      <Breadcrumb items={getBreadcrumbItems()} />
    </div>
  );
}
