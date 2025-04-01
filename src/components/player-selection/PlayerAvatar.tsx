
import React from "react";
import { Player } from "@/types/player";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface PlayerAvatarProps {
  player: Player;
  size?: "sm" | "md" | "lg";
}

export function PlayerAvatar({ player, size = "md" }: PlayerAvatarProps) {
  // Calculate size in pixels
  const sizeMap = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const initials = player.name
    .split(" ")
    .map(n => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Avatar className={sizeMap[size]}>
      {player.image ? (
        <AvatarImage src={player.image} alt={player.name} />
      ) : null}
      <AvatarFallback className="bg-primary/10 text-primary">
        {initials || <User className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  );
}
