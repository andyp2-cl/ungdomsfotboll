
import React from "react";
import { Activity } from "@/types/player";
import { 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";

interface ActivityHeaderProps {
  activity: Activity;
}

export function ActivityHeader({ activity }: ActivityHeaderProps) {
  return (
    <CardHeader className="pb-3">
      <div className="flex items-center space-x-2">
        <CardTitle>{activity.name}</CardTitle>
        <Badge variant={activity.type === "match" ? "default" : "secondary"}>
          {activity.type === "match" ? "Match" : "Cup"}
        </Badge>
      </div>
      <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
        <span className="flex items-center">
          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
          {new Date(activity.date).toLocaleDateString('sv-SE')}
        </span>
        {activity.time && (
          <span className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
            {activity.time}
          </span>
        )}
        {activity.location && (
          <span className="flex items-center">
            <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
            {activity.location.name}
            {activity.location.gpsLink && (
              <a
                href={activity.location.gpsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-blue-500 hover:underline"
              >
                (Karta)
              </a>
            )}
          </span>
        )}
      </CardDescription>
    </CardHeader>
  );
}
