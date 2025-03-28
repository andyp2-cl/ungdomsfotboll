
import { Activity, ActivityType } from "@/types/player";

interface ScrapedMatch {
  name: string;
  date: string;
  type: ActivityType;
}

export async function scrapeHifMatches(year: string = "2025"): Promise<ScrapedMatch[]> {
  try {
    // We need to fetch from the webcal URL and parse the iCalendar format
    // Convert webcal to https for fetch compatibility
    const calendarUrl = "https://cal.svenskalag.se/34091";
    console.log(`Fetching calendar data from ${calendarUrl}...`);
    
    const response = await fetch(calendarUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch calendar data: ${response.status}`);
    }
    
    const icalData = await response.text();
    console.log(`Received iCalendar data of length: ${icalData.length}`);
    
    // Parse the iCalendar data to extract events
    const events = parseICalEvents(icalData);
    console.log(`Parsed ${events.length} events from calendar`);
    
    // Filter events by year
    const selectedYearEvents = events.filter(event => {
      const eventYear = event.date.substring(0, 4);
      return eventYear === year;
    });
    
    console.log(`Found ${selectedYearEvents.length} events for year ${year}`);
    
    return selectedYearEvents;
  } catch (error) {
    console.error("Error scraping calendar data:", error);
    // Fallback to mock data if the scraping fails
    return generateMockData(year);
  }
}

// Parse iCalendar format to extract events
function parseICalEvents(icalData: string): ScrapedMatch[] {
  const events: ScrapedMatch[] = [];
  const eventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
  const summaryRegex = /SUMMARY:([^\n]+)/;
  const dtStartRegex = /DTSTART:(\d{8}T\d{6}Z?)/;
  
  let match;
  while ((match = eventRegex.exec(icalData)) !== null) {
    const eventData = match[1];
    
    // Extract summary (name)
    const summaryMatch = summaryRegex.exec(eventData);
    if (!summaryMatch) continue;
    const name = summaryMatch[1].trim();
    
    // Extract start date and time
    const dtStartMatch = dtStartRegex.exec(eventData);
    if (!dtStartMatch) continue;
    
    // Parse the date from ical format (YYYYMMDDTHHMMSSZ)
    const dtStart = dtStartMatch[1];
    const year = dtStart.substring(0, 4);
    const month = dtStart.substring(4, 6);
    const day = dtStart.substring(6, 8);
    const date = `${year}-${month}-${day}`;
    
    // Determine activity type based on name
    const type: ActivityType = name.toLowerCase().includes('cup') ? 'cup' : 'match';
    
    events.push({
      name,
      date,
      type
    });
  }
  
  return events;
}

// Generate mock data as fallback
function generateMockData(year: string): ScrapedMatch[] {
  console.warn("Using fallback mock data");
  return [
    {
      name: "Match mot IFK Hässleholm svart (FALLBACK)",
      date: `${year}-01-17`,
      type: "match",
    },
    {
      name: "Match mot Åhus Horna BK vit (FALLBACK)",
      date: `${year}-01-19`,
      type: "match",
    },
    {
      name: "Match mot Vittsjö GIK (FALLBACK)",
      date: `${year}-01-19`,
      type: "match",
    }
  ];
}

// Convert scraped matches to activities
export function convertScrapedToActivities(
  scrapedMatches: ScrapedMatch[]
): Activity[] {
  let nextId = Math.max(...mockActivityIds()) + 1;
  
  return scrapedMatches.map(match => {
    // Lagra aktuellt ID och öka för nästa användning
    const currentId = nextId;
    nextId++;
    
    return {
      id: currentId.toString(),
      name: match.name,
      date: match.date,
      type: match.type,
      participants: [],
      kioskScheduleId: nextId.toString(), // Skapa en relaterad kioskschema
      scraped: true // Markera denna aktivitet som skrapad
    };
  });
}

// Hjälpfunktion för att få befintliga ID:n för att undvika konflikter
function mockActivityIds(): number[] {
  try {
    // I en riktig implementation skulle vi importera direkt från mockData
    // men för att undvika cirkulära beroenden använder vi detta tillvägagångssätt
    const activityData = localStorage.getItem('mockActivities');
    if (activityData) {
      const activities = JSON.parse(activityData);
      return activities.map((act: Activity) => parseInt(act.id));
    }
    return [100]; // Fallback startande ID
  } catch (error) {
    console.error("Error getting activity IDs:", error);
    return [100]; // Fallback startande ID
  }
}
