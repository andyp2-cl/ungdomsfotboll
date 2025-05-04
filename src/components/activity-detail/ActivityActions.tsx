
import React from "react";
import { Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ActivityActionsProps {
  activity: Activity;
  onEdit: () => void;
  onDelete: () => void;
}

export function ActivityActions({ activity, onEdit, onDelete }: ActivityActionsProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2 items-center justify-end mt-2`}>
      <Button 
        variant="outline" 
        size={isMobile ? "sm" : "default"} 
        onClick={onEdit}
        className="flex items-center gap-1"
      >
        <Edit className={`h-${isMobile ? '3' : '4'} w-${isMobile ? '3' : '4'}`} />
        Redigera
      </Button>
      <Button 
        variant="destructive" 
        size={isMobile ? "sm" : "default"} 
        onClick={onDelete}
        className="flex items-center gap-1"
      >
        <Trash2 className={`h-${isMobile ? '3' : '4'} w-${isMobile ? '3' : '4'}`} />
        Ta bort
      </Button>
    </div>
  );
}
