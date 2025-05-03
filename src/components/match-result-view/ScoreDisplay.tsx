
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Activity } from "@/types/player";

interface ScoreDisplayProps {
  label: string;
  value?: number;
  isHighlighted?: boolean;
}

export function ScoreDisplay({ label, value, isHighlighted = false }: ScoreDisplayProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-1">
      <div className={`font-medium text-center ${isMobile ? 'text-xs' : 'text-sm'} ${isHighlighted ? "font-semibold" : ""}`}>
        {label}
      </div>
      <div className={`text-center text-lg font-bold ${isHighlighted ? "text-blue-600" : "text-gray-800"}`}>
        {value !== undefined ? value : "-"}
      </div>
    </div>
  );
}
