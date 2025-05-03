
import React from "react";
import { Trophy, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ActivityHeaderProps {
  name: string;
  isMobile?: boolean;
  isCupMatch?: boolean;
  leagueName?: string;
}

export function ActivityHeader({ 
  name, 
  isMobile = false, 
  isCupMatch = false, 
  leagueName 
}: ActivityHeaderProps) {
  return (
    <h3 className={`font-bold ${isMobile ? 'text-base' : ''} flex items-center flex-wrap gap-2`}>
      {name}
      {isCupMatch && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Trophy className="h-3.5 w-3.5" />
          Cupmatch
        </Badge>
      )}
      {leagueName && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Award className="h-3.5 w-3.5" />
          {leagueName}
        </Badge>
      )}
    </h3>
  );
}
