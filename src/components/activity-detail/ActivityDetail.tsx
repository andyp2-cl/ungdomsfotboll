
import React, { useState } from "react";
import { Activity, Player } from "@/types/player";
import { ActivityHeader } from "./ActivityHeader";
import { ActivityDetailContent } from "./ActivityDetailContent";
import { DeleteActivityDialog } from "./DeleteActivityDialog";

interface ActivityDetailProps {
  activity: Activity;
  players: Player[];
  onBack: () => void;
  onEdit: (activity: Activity) => void;
  onDelete: (activityId: string) => Promise<boolean>;
  onUpdate: (activity: Activity) => void;
  onKioskUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  onActivitySelect?: (activity: Activity | null) => void;
  relatedActivities?: Activity[];
  cupMatches?: Activity[];
  allActivities?: Activity[];
  onClose?: () => void;
}

export function ActivityDetail({
  activity,
  players,
  onBack,
  onEdit,
  onDelete,
  onUpdate,
  onKioskUpdate,
  onActivitySelect,
  relatedActivities = [],
  cupMatches = [],
  allActivities = [],
  onClose
}: ActivityDetailProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle delete
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await onDelete(activity.id);
      if (success) {
        setIsDeleteDialogOpen(false);
        onBack();
      }
    } catch (error) {
      console.error("Error deleting activity:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header section with back button, title, and action buttons */}
      <ActivityHeader 
        activity={activity}
        onClose={onClose || onBack}
        onEdit={() => onEdit(activity)}
        onDelete={() => setIsDeleteDialogOpen(true)}
      />

      {/* Main content */}
      <ActivityDetailContent
        activity={activity}
        players={players}
        onUpdate={onUpdate}
        onKioskUpdate={onKioskUpdate}
        onActivitySelect={onActivitySelect}
        cupMatches={cupMatches}
      />

      {/* Delete confirmation dialog */}
      <DeleteActivityDialog
        activityName={activity.name}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDelete}
      />
    </div>
  );
}
