
import React from "react";
import { Player } from "@/types/player";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface PlayerRowProps {
  player: Player;
  onClick?: () => void;
  isSelected?: boolean;
}

export function PlayerRow({ player, onClick, isSelected }: PlayerRowProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div 
      className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-accent/50 transition-colors ${
        isSelected ? "bg-accent" : ""
      }`}
      onClick={onClick}
    >
      <Avatar className="h-10 w-10 mr-3">
        {player.image ? (
          <AvatarImage src={player.image} alt={player.name} />
        ) : (
          <AvatarFallback>{getInitials(player.name)}</AvatarFallback>
        )}
      </Avatar>
      <div className="flex-1">
        <div className="font-medium">{player.name}</div>
        <div className="text-sm text-muted-foreground">
          {player.positions && player.positions.length > 0
            ? player.positions.join(", ")
            : "Ingen position"}
        </div>
      </div>
      {player.grade && (
        <Badge variant="outline" className="ml-2">
          {player.grade}
        </Badge>
      )}
    </div>
  );
}
