
import { Activity, ActivityType } from "@/types/player";
import { v4 as uuidv4 } from 'uuid';
import { generateFootballFieldUrl } from "@/utils/locationUtils";

export const parseActivitiesFromContent = (content: string): Activity[] => {
  try {
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    const activities: Activity[] = [];
    
    let currentMonth = "";
    let currentYear = new Date().getFullYear().toString();
    let currentDate = "";
    let currentTime = "";
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if this is a month line
      if (line.match(/^[A-Za-zåäöÅÄÖ]+$/)) {
        currentMonth = line;
        continue;
      }
      
      // Check if this is a date line (e.g. "Lör 12")
      const dateMatch = line.match(/^([A-Za-zåäöÅÄÖ]+)\s+(\d+)$/);
      if (dateMatch) {
        const day = dateMatch[2].padStart(2, '0');
        const monthMap: {[key: string]: string} = {
          "Januari": "01", "Februari": "02", "Mars": "03", "April": "04",
          "Maj": "05", "Juni": "06", "Juli": "07", "Augusti": "08",
          "September": "09", "Oktober": "10", "November": "11", "December": "12",
          "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", 
          "Jun": "06", "Jul": "07", "Aug": "08", 
          "Sep": "09", "Okt": "10", "Nov": "11", "Dec": "12"
        };
        
        const monthNumber = monthMap[currentMonth] || "01"; // Default to January if unknown
        currentDate = `${currentYear}-${monthNumber}-${day}`;
        continue;
      }
      
      // Check if this is a time line (e.g. "09:30")
      const timeMatch = line.match(/^(\d{2}:\d{2})$/);
      if (timeMatch && currentDate) {
        currentTime = timeMatch[1];
        continue;
      }
      
      // Check if this is a match line (starts with dash)
      const matchLineMatch = line.match(/^-(.+)$/);
      if (matchLineMatch && currentDate && currentTime) {
        const matchName = matchLineMatch[1].trim();
        
        // Get location from next line if available
        let location = "";
        let locationDesc = "";
        
        if (i + 1 < lines.length && !lines[i + 1].match(/^-|^(\d{2}:\d{2})$/) && !lines[i + 1].match(/^[A-Za-zåäöÅÄÖ]+\s+\d+$/) && !lines[i + 1].match(/^[A-Za-zåäöÅÄÖ]+$/)) {
          const locationLine = lines[i + 1].trim();
          
          // Try to split location and description if possible
          const locationParts = locationLine.split(/\s+(?=[A-Za-zåäöÅÄÖ]-plan)/);
          
          if (locationParts.length > 1) {
            location = locationParts[0].trim();
            locationDesc = locationParts[1].trim();
          } else {
            location = locationLine;
          }
          
          i++; // Skip the location line in the next iteration
        }
        
        // Determine if it's a cup or match
        const type: ActivityType = matchName.toLowerCase().includes('cup') ? 'cup' : 'match';
        
        // Create activity object
        const activity: Activity = {
          id: uuidv4(),
          name: matchName,
          date: currentDate,
          time: currentTime,
          type: type,
          participants: [],
        };
        
        // Add location if available
        if (location) {
          activity.location = {
            name: location,
            description: locationDesc,
            gpsLink: generateFootballFieldUrl(location)
          };
        }
        
        activities.push(activity);
        
        // Reset current time for the next match
        currentTime = "";
      }
    }
    
    return activities;
  } catch (error) {
    console.error("Error parsing activities:", error);
    return [];
  }
};
