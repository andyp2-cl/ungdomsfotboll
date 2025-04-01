
import React from "react";
import { Activity } from "@/types/player";
import { X, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { CalendarIcon, Clock, MapPin } from "lucide-react";

interface ActivityDetailHeaderProps {
  activity: Activity;
  isHistorical: boolean;
  onClose: () => void;
  onEdit?: (activity: Activity) => void;
  onDeleteOpen: () => void;
}

export function ActivityDetailHeader({ 
  activity, 
  isHistorical,
  onClose, 
  onEdit, 
  onDeleteOpen 
}: ActivityDetailHeaderProps) {
  const formattedDate = new Date(activity.date).toLocaleDateString('sv-SE');
  const dayOfWeek = new Date(activity.date).toLocaleDateString('sv-SE', { weekday: 'long' });
  const capitalizedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

  const formatResult = () => {
    if (activity.homeScore !== undefined && activity.awayScore !== undefined) {
      return `${activity.homeScore}-${activity.awayScore}`;
    }
    return activity.result || "";
  };

  return (
    <CardHeader>
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-2xl mb-1 flex items-center">
            {activity.name}
            <Badge 
              variant={activity.type === "match" ? "default" : "secondary"}
              className="ml-3"
            >
              {activity.type === "match" ? "Match" : "Cup"}
            </Badge>
            {isHistorical && (
              <Badge variant="outline" className="ml-2">
                Tidigare
              </Badge>
            )}
            {isHistorical && activity.type === "match" && formatResult() && (
              <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 border-blue-300">
                {formatResult()}
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="flex flex-col gap-1">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {capitalizedDayOfWeek} {formattedDate}
              {activity.time && (
                <span className="ml-2 flex items-center">
                  <Clock className="h-4 w-4 ml-2 mr-1" />
                  {activity.time}
                </span>
              )}
            </div>
            
            {activity.location && (
              <div className="flex items-center mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{activity.location.name}</span>
                {activity.location.description && (
                  <span className="text-muted-foreground ml-1">({activity.location.description})</span>
                )}
                {activity.location.gpsLink && (
                  <a 
                    href={activity.location.gpsLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:underline text-sm"
                  >
                    GPS
                  </a>
                )}
              </div>
            )}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" size="icon" onClick={() => onEdit(activity)}>
              <Edit className="h-5 w-5" />
            </Button>
          )}
          {onDeleteOpen && (
            <Button 
              variant="outline" 
              size="icon" 
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={onDeleteOpen}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </CardHeader>
  );
}
