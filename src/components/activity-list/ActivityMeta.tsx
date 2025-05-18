
import React from 'react';
import { Calendar, Clock, Map } from 'lucide-react';

interface ActivityMetaProps {
  date: string;
  time?: string;
  location?: { name: string };
  isMobile?: boolean;
}

export function ActivityMeta({ date, time, location, isMobile = false }: ActivityMetaProps) {
  const formattedDate = new Date(date).toLocaleDateString('sv-SE');
  const dayOfWeek = new Date(date).toLocaleDateString('sv-SE', { weekday: 'long' });
  const capitalizedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
  
  return (
    <div className={`flex flex-wrap gap-2 text-sm mt-2 ${isMobile ? 'text-xs' : ''}`}>
      <div className="flex items-center gap-1 text-muted-foreground">
        <Calendar className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
        <span>{capitalizedDayOfWeek} {formattedDate}</span>
      </div>
      
      {time && (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
          <span>{time}</span>
        </div>
      )}
      
      {location?.name && (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Map className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
          <span>{location.name}</span>
        </div>
      )}
    </div>
  );
}
