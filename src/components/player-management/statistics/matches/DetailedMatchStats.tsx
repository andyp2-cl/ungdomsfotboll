
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Player } from "@/types/player";

interface DetailedMatchStatsProps {
  label: string;
  value: number | string;
  className?: string;
  onPlayerSelect?: (playerId: string) => void;
}

export function DetailedMatchStats({ label, value, className = "", onPlayerSelect }: DetailedMatchStatsProps) {
  const handleClick = () => {
    if (onPlayerSelect) {
      onPlayerSelect(label);
    }
  };

  return (
    <div 
      className={`flex justify-between items-center p-3 rounded-md ${onPlayerSelect ? 'cursor-pointer hover:bg-muted' : ''} ${className}`}
      onClick={handleClick}
    >
      <span className="font-medium">{label}</span>
      <span>{value}</span>
    </div>
  );
}
