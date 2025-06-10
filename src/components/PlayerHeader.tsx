import React from "react";
// import { Link } from "react-router-dom"; // Tas bort, behövs ej
import { useLocation } from "react-router-dom";
// import { Breadcrumb } from "@/components/Breadcrumb"; // Tas bort
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
  // const location = useLocation(); // Behövs ej längre
  
  // Om vi har en spelare, visa spelarspecifik header
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
  
  // Förbättrad header med logotyp och gradienttext
  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 justify-center md:justify-start">
        <img src="/hif-logo.png" alt="Hässleholms IF" className="h-20 w-20 md:h-24 md:w-24 drop-shadow-xl" style={{background: 'white', borderRadius: '50%', border: '2px solid #006633'}} />
        <span
          className="text-4xl md:text-5xl font-extrabold tracking-tight"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            background: 'linear-gradient(90deg, #006633 0%, #00b36b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.04em',
            textShadow: '2px 2px 8px rgba(0,0,0,0.08)'
          }}
        >
          HIF P2014
        </span>
      </div>
    </div>
  );
}
