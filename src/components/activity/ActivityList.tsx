
import React from 'react';
import { Activity, Player } from '@/types/player';

interface ActivityListProps {
  activities: Activity[];
  onActivitySelect: (activity: Activity) => void;
  onDelete?: (activityId: string) => Promise<boolean>;
  onPlayerSelect?: (player: Player) => void;
}

export function ActivityList({
  activities,
  onActivitySelect,
  onDelete,
  onPlayerSelect
}: ActivityListProps) {
  return (
    <div className="space-y-2">
      {activities.map(activity => (
        <div 
          key={activity.id}
          className="p-3 border rounded-md hover:bg-accent/10 cursor-pointer"
          onClick={() => onActivitySelect(activity)}
        >
          <h3 className="font-medium">{activity.name}</h3>
          <div className="text-sm text-muted-foreground">{activity.date}</div>
        </div>
      ))}
      {activities.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          Inga aktiviteter hittades
        </div>
      )}
    </div>
  );
}
