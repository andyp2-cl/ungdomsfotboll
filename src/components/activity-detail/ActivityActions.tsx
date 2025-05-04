
import React from "react";
import { Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface ActivityActionsProps {
  activity: Activity;
  onEdit: () => void;
  onDelete: () => void;
}

export function ActivityActions({ activity, onEdit, onDelete }: ActivityActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        variant="outline" 
        onClick={onEdit}
        size="sm"
        className="flex items-center gap-1"
      >
        <Edit className="h-4 w-4" />
        Redigera
      </Button>
      <Button 
        variant="destructive" 
        onClick={onDelete}
        size="sm"
        className="flex items-center gap-1"
      >
        <Trash2 className="h-4 w-4" />
        Ta bort
      </Button>
    </div>
  );
}
