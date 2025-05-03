
import { Activity } from "@/types/player";

/**
 * Parse CSV content for activities
 */
export const parseCSVContent = (content: string): Activity[] => {
  const lines = content.split('\n');
  if (lines.length <= 1) return [];
  
  // Get header row
  const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
  
  // Check for required columns
  const idIndex = headers.indexOf('id');
  const nameIndex = headers.indexOf('name');
  const dateIndex = headers.indexOf('date');
  const typeIndex = headers.indexOf('type');
  
  if (nameIndex === -1 || dateIndex === -1 || typeIndex === -1) {
    console.error("Required columns missing in CSV");
    return [];
  }
  
  const activities: Activity[] = [];
  
  // Start from 1 to skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',').map(value => value.trim());
    
    // Create activity object
    const activity: Activity = {
      id: idIndex !== -1 ? values[idIndex] : crypto.randomUUID(),
      name: values[nameIndex],
      date: values[dateIndex],
      type: values[typeIndex] as any,
      participants: []
    };
    
    // Add optional fields
    const timeIndex = headers.indexOf('time');
    if (timeIndex !== -1 && values[timeIndex]) {
      activity.time = values[timeIndex];
    }
    
    const locationNameIndex = headers.indexOf('location_name');
    if (locationNameIndex !== -1 && values[locationNameIndex]) {
      activity.location = {
        name: values[locationNameIndex],
        description: '',
        gpsLink: ''
      };
      
      const locationDescIndex = headers.indexOf('location_description');
      if (locationDescIndex !== -1 && values[locationDescIndex]) {
        activity.location.description = values[locationDescIndex];
      }
      
      const locationGpsIndex = headers.indexOf('location_gps_link');
      if (locationGpsIndex !== -1 && values[locationGpsIndex]) {
        activity.location.gpsLink = values[locationGpsIndex];
      }
    }
    
    // Cup ID
    const cupIdIndex = headers.indexOf('cup_id');
    if (cupIdIndex !== -1 && values[cupIdIndex]) {
      activity.cupId = values[cupIdIndex];
    }
    
    activities.push(activity);
  }
  
  return activities;
};
