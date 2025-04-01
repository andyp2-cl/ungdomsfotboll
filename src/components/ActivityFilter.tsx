
import React from "react";
import { Badge } from "@/components/ui/badge";

interface ActivityFilterProps {
  selectedTypes: string[];
  onTypeChange: (type: string) => void;
  isMobile?: boolean;
}

export function ActivityFilter({ selectedTypes, onTypeChange, isMobile = false }: ActivityFilterProps) {
  const activityTypes = [
    { id: "match", label: "Match" },
    { id: "training", label: "Träning" },
    { id: "cup", label: "Cup" },
    { id: "other", label: "Övrigt" }
  ];
  
  return (
    <div className={`flex ${isMobile ? 'space-x-2' : 'flex-wrap space-x-1 sm:space-x-2'}`}>
      {activityTypes.map(type => (
        <Badge
          key={type.id}
          variant={selectedTypes.includes(type.id) ? "default" : "outline"}
          className={`cursor-pointer ${isMobile ? 'text-sm py-1 px-2 whitespace-nowrap' : ''}`}
          onClick={() => onTypeChange(type.id)}
        >
          {type.label}
        </Badge>
      ))}
    </div>
  );
}
