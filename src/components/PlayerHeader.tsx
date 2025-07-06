import React from "react";
import { useLocation } from "react-router-dom";
import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Edit, LogOut, User } from "lucide-react";
import { useAuth } from "@/integrations/supabase/auth";

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
  const { user, signOut } = useAuth();
  
  // Om vi har en spelare, visa spelarspecifik header
  if (player) {
    return (
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold">{player.name}</h2>
          <p className="text-muted-foreground">Nivå: {player.grade}</p>
        </div>
        
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(player)}>
              <Edit className="h-4 w-4 mr-2" />
              Redigera
            </Button>
          )}
          
          {/* Logout button för spelarvy */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={signOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
  
  // Förbättrad header med logotyp, gradienttext och logout-knapp
  return (
    <div className="mb-8">
      {/* Logout button i högra hörnet */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{user?.email}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={signOut}
            className="text-muted-foreground hover:text-foreground hover:bg-red-50 hover:text-red-600"
            title="Logga ut"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div
        className="flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-8 justify-center md:justify-start cursor-pointer"
        onClick={() => { window.location.href = '/players'; }}
        title="Gå till Spelare"
      >
        {/* Logo utan ringar och med skugga */}
        <div className="relative">
          <img 
            src="/hif-logo.png" 
            alt="Hässleholms IF" 
            className="h-24 w-24 md:h-28 md:w-28 object-contain drop-shadow-lg hover:drop-shadow-xl transition-all duration-300" 
          />
          {/* Subtil bakgrundscirkel för djup */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 rounded-full scale-110 -z-10 opacity-30"></div>
        </div>
        
        {/* Förbättrad text med gradients och typografi */}
        <div className="text-center md:text-left">
          <h1
            className="text-5xl md:text-6xl font-black tracking-tight leading-none"
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              background: 'linear-gradient(135deg, #065f46 0%, #059669 50%, #10b981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 4px 12px rgba(6, 95, 70, 0.15)',
            }}
          >
            HIF P2014
          </h1>
          {/* Subtitle för extra kontext */}
          <p className="text-lg md:text-xl text-muted-foreground font-medium mt-2 tracking-wide">
            Hässleholms IF
          </p>
        </div>
      </div>
    </div>
  );
}
