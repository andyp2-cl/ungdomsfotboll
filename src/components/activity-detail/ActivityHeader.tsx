
import { Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, X } from "lucide-react";

interface ActivityHeaderProps {
  activity: Activity;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function ActivityHeader({
  activity,
  onEdit,
  onDelete,
  onClose
}: ActivityHeaderProps) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h2 className="text-2xl font-semibold">{activity.name}</h2>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="icon" onClick={onEdit}>
          <Edit className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={onDelete}>
          <Trash2 className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
