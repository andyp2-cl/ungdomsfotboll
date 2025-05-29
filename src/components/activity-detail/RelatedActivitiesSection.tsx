
import React from "react";
import { Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface RelatedActivitiesSectionProps {
  relatedActivities: Activity[];
  onActivitySelect?: (activity: Activity) => void;
}

export function RelatedActivitiesSection({ 
  relatedActivities, 
  onActivitySelect 
}: RelatedActivitiesSectionProps) {
  if (relatedActivities.length === 0) {
    return null;
  }

  return (
    <div className="border rounded-md p-3">
      <h3 className="text-base font-semibold mb-2">Relaterade aktiviteter</h3>
      <ul className="space-y-1">
        {relatedActivities.map(activity => (
          <li 
            key={activity.id}
            onClick={() => onActivitySelect?.(activity)}
            className="cursor-pointer hover:bg-gray-50 p-2 rounded-md flex items-center justify-between"
          >
            <div className="text-sm">
              {activity.name} - {new Date(activity.date).toLocaleDateString()}
              {activity.homeScore !== undefined && activity.awayScore !== undefined && (
                <span className="ml-2 font-medium">
                  {activity.homeScore}-{activity.awayScore}
                </span>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-6 w-6 p-0"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
