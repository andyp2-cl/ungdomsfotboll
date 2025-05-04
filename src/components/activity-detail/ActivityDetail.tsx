
import React from "react";
import { Activity, Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ActivityHeader } from "./ActivityHeader";
import { MatchResultSection } from "./match-result/MatchResultSection";

interface ActivityDetailProps {
  activity: Activity;
  players: Player[];
  onClose: () => void;
  onEdit: (activity: Activity) => void;
  onActivityUpdate: (activity: Activity) => Promise<void>;
  onKioskAssignmentUpdate?: (activityId: string, playerId?: string) => Promise<boolean>;
  onDeleteActivity: (activityId: string) => Promise<boolean>;
  allActivities: Activity[];
  relatedActivities?: Activity[];
  cupMatches?: Activity[];
  onActivitySelect?: (activity: Activity) => void;
  onMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<boolean>;
}

export function ActivityDetail({
  activity,
  players,
  onClose,
  onEdit,
  onActivityUpdate,
  onDeleteActivity,
  allActivities,
  relatedActivities = [],
  cupMatches = [],
  onActivitySelect,
  onMatchResultUpdate
}: ActivityDetailProps) {
  
  return (
    <Card className="relative">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Aktivitetsdetaljer</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <ActivityHeader activity={activity} />
        
        {/* Create an ActivityActions component */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => onEdit(activity)}
            size="sm"
          >
            Redigera
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => onDeleteActivity(activity.id)}
            size="sm"
          >
            Ta bort
          </Button>
        </div>
        
        {activity.type === "match" && onMatchResultUpdate && (
          <MatchResultSection 
            activity={activity}
            onMatchResultUpdate={onMatchResultUpdate}
          />
        )}
      </CardContent>
    </Card>
  );
}
