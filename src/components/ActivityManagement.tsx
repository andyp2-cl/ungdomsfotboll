import { useState } from "react";
import { Activity, Player } from "@/types/player";
import { ActivityDetail } from "@/components/ActivityDetail";
import { ActivityList } from "@/components/ActivityList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddActivityForm } from "@/components/AddActivityForm";
import { EditActivityForm } from "@/components/EditActivityForm";

interface ActivityManagementProps {
  activities: Activity[];
  players: Player[];
  onActivityUpdate: (activity: Activity) => void;
  onActivityDelete: (activityId: string) => Promise<boolean>;
  onKioskAssignment: (activityId: string, playerId?: string) => Promise<boolean>;
  onAddActivity: (activity: Activity) => void;
}

export function ActivityManagement({
  activities,
  players,
  onActivityUpdate,
  onActivityDelete,
  onKioskAssignment,
  onAddActivity
}: ActivityManagementProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);

  const handleAddActivity = (activity: Activity) => {
    onAddActivity(activity);
    setIsAddActivityOpen(false);
  };

  const handleEditActivity = (activity: Activity) => {
    onActivityUpdate(activity);
    setEditingActivity(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Aktiviteter</h2>
        <Button onClick={() => setIsAddActivityOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Lägg till aktivitet
        </Button>
      </div>

      {selectedActivity ? (
        <ActivityDetail
          activity={selectedActivity}
          players={players}
          onClose={() => setSelectedActivity(null)}
          onEdit={setEditingActivity}
          onAssignKiosk={onKioskAssignment}
          onRemoveKioskAssignment={(activityId) => onKioskAssignment(activityId)}
        />
      ) : (
        <ActivityList
          activities={activities}
          players={players}
          onSelect={setSelectedActivity}
          onPlayerSelect={() => {}}
        />
      )}

      {isAddActivityOpen && (
        <AddActivityForm
          onSave={handleAddActivity}
          onCancel={() => setIsAddActivityOpen(false)}
        />
      )}

      {editingActivity && (
        <EditActivityForm
          activity={editingActivity}
          onSave={handleEditActivity}
          onCancel={() => setEditingActivity(null)}
        />
      )}
    </div>
  );
}
