
import React from "react";
import { Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface ActivityActionsProps {
  activity: Activity;
  onEdit: () => void;
  onDelete: () => Promise<boolean>;
}

export function ActivityActions({ activity, onEdit, onDelete }: ActivityActionsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-end">
      <Button variant="outline" size="sm" onClick={onEdit}>
        <Edit className="h-4 w-4 mr-2" />
        Redigera
      </Button>
      
      <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={onDelete}>
        <Trash2 className="h-4 w-4 mr-2" />
        Ta bort
      </Button>
    </div>
  );
}
