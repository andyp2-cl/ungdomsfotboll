
import React from "react";
import { Calendar, Clock, Map } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ActivityMetadataProps {
  date: string;
  time?: string;
  locationName?: string;
  isMobile?: boolean;
}

export function ActivityMetadata({ 
  date, 
  time, 
  locationName,
  isMobile: propIsMobile
}: ActivityMetadataProps) {
  const mobileFromHook = useIsMobile();
  const isMobileView = propIsMobile !== undefined ? propIsMobile : mobileFromHook;

  // Format date to show day of week
  const formattedDate = new Date(date).toLocaleDateString('sv-SE');
  const dayOfWeek = new Date(date).toLocaleDateString('sv-SE', { weekday: 'long' });
  const capitalizedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

  return (
    <div className={`flex flex-wrap gap-2 text-sm mt-2 ${isMobileView ? 'text-xs' : ''}`}>
      <div className="flex items-center gap-1 text-muted-foreground">
        <Calendar className={`${isMobileView ? 'h-3 w-3' : 'h-4 w-4'}`} />
        <span>{capitalizedDayOfWeek} {formattedDate}</span>
      </div>
      
      {time && (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className={`${isMobileView ? 'h-3 w-3' : 'h-4 w-4'}`} />
          <span>{time}</span>
        </div>
      )}
      
      {locationName && (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Map className={`${isMobileView ? 'h-3 w-3' : 'h-4 w-4'}`} />
          <span>{locationName}</span>
        </div>
      )}
    </div>
  );
}
