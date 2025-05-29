
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Player } from "@/types/player";

interface PlayerStatusIndicatorProps {
  player: Player;
  size?: "sm" | "md" | "lg";
}

export function PlayerStatusIndicator({ player, size = "sm" }: PlayerStatusIndicatorProps) {
  const isActive = player.isActive !== undefined ? player.isActive : true;
  
  if (isActive) {
    return null; // Don't show anything for active players
  }
  
  const sizeClasses = {
    sm: "text-xs px-1 py-0.5",
    md: "text-sm px-2 py-1", 
    lg: "text-base px-3 py-1.5"
  };
  
  return (
    <Badge 
      variant="secondary" 
      className={`bg-gray-100 text-gray-600 ${sizeClasses[size]}`}
    >
      Inaktiv
    </Badge>
  );
}
