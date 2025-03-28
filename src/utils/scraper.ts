import { Activity, ActivityType, Player } from "@/types/player";
import { generateFootballFieldUrl } from "./locationUtils";
import { v4 as uuidv4 } from 'uuid';

interface ScrapedMatch {
  name: string;
  date: string;
  type: ActivityType;
  location?: string;
  locationDetails?: string;
  time?: string;
}

// Helper function to extract player information from HTML
export async function scrapePlayerImages(url: string, players: Player[]): Promise<Player[]> {
  try {
    // Use a CORS proxy to fetch the webpage
    const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status}`);
    }
    
    const html = await response.text();
    console.log(`Received HTML content of length: ${html.length}`);
    
    // Parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    
    // Try various selectors that might contain player information
    const selectors = [
      ".sv-channel-content > div", 
      ".player-card", 
      ".team-member",
      ".roster-player",
      ".player-profile",
      ".members-list > div",
      ".team-list > div",
      ".roster > div",
      "div:has(img):has(h3)",
      "div:has(img):has(.player-name)",
      ".sv-text-portlet-content",
      // More general selectors
      ".sv-layout > div",
      ".container div"
    ];
    
    let playerElements: NodeListOf<Element> | null = null;
    
    for (const selector of selectors) {
      const elements = doc.querySelectorAll(selector);
      if (elements && elements.length > 0) {
        console.log(`Found ${elements.length} elements with selector: ${selector}`);
        playerElements = elements;
        break;
      }
    }
    
    if (!playerElements || playerElements.length === 0) {
      throw new Error("No player elements found on the page");
    }
    
    const updatedPlayers: Player[] = [...players];
    let matchCount = 0;
    
    // Process each element to extract player information
    Array.from(playerElements).forEach((element, index) => {
      // Try to find player name with various selectors
      let playerName: string | null = null;
      const nameSelectors = ['h3', 'h4', '.player-name', '.name', 'strong', 'b', 'p'];
      
      for (const selector of nameSelectors) {
        const nameElement = element.querySelector(selector);
        if (nameElement && nameElement.textContent) {
          playerName = nameElement.textContent.trim();
          if (playerName) {
            console.log(`Found player name: ${playerName}`);
            break;
          }
        }
      }
      
      if (!playerName) return;
      
      // Find player image
      const imgElement = element.querySelector("img");
      if (!imgElement) return;
      
      let imgSrc = imgElement.getAttribute("src");
      if (!imgSrc) return;
      
      // Make the image URL absolute if it's relative
      if (imgSrc.startsWith('/')) {
        const urlObj = new URL(url);
        imgSrc = `${urlObj.origin}${imgSrc}`;
      } else if (!imgSrc.startsWith('http')) {
        const urlObj = new URL(url);
        imgSrc = `${urlObj.origin}/${imgSrc}`;
      }
      
      console.log(`Found image for ${playerName}: ${imgSrc}`);
      
      // Try to match the player with our database
      // First try exact name match
      let playerIndex = updatedPlayers.findIndex(
        p => p.name.toLowerCase() === playerName.toLowerCase()
      );
      
      // If not found, try with first name only
      if (playerIndex === -1) {
        const firstName = playerName.split(' ')[0].toLowerCase();
        playerIndex = updatedPlayers.findIndex(
          p => p.name.toLowerCase().includes(firstName)
        );
      }
      
      // If still not found, try with last name
      if (playerIndex === -1 && playerName.includes(' ')) {
        const lastName = playerName.split(' ').pop()?.toLowerCase() || '';
        if (lastName.length > 2) { // Avoid matching very short last names
          playerIndex = updatedPlayers.findIndex(
            p => p.name.toLowerCase().includes(lastName)
          );
        }
      }
      
      if (playerIndex >= 0) {
        updatedPlayers[playerIndex] = {
          ...updatedPlayers[playerIndex],
          image: imgSrc,
        };
        matchCount++;
        console.log(`Matched player: ${playerName} with ${updatedPlayers[playerIndex].name}`);
      }
    });
    
    if (matchCount === 0) {
      throw new Error("No players from the website matched with your team roster");
    }
    
    console.log(`Successfully matched ${matchCount} players`);
    return updatedPlayers;
  } catch (error) {
    console.error("Error scraping player images:", error);
    throw error;
  }
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
  const locationRegex = /LOCATION:([^\n]+)/;
  const descriptionRegex = /DESCRIPTION:([^\n]+)/;
  
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
    
    // Extract time if available
    const hour = dtStart.substring(9, 11);
    const minute = dtStart.substring(11, 13);
    const time = `${hour}:${minute}`;
    
    // Extract location if available
    let location = undefined;
    const locationMatch = locationRegex.exec(eventData);
    if (locationMatch) {
      location = locationMatch[1].trim();
    }
    
    // Extract description if available
    let locationDetails = undefined;
    const descriptionMatch = descriptionRegex.exec(eventData);
    if (descriptionMatch) {
      locationDetails = descriptionMatch[1].trim();
    }
    
    // Determine activity type based on name
    const type: ActivityType = name.toLowerCase().includes('cup') ? 'cup' : 'match';
    
    events.push({
      name,
      date,
      type,
      location,
      locationDetails,
      time
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
      location: "Österås IP",
      locationDetails: "Plan 7-manna 1",
      time: "09:30"
    },
    {
      name: "Match mot Åhus Horna BK vit (FALLBACK)",
      date: `${year}-01-19`,
      type: "match",
      location: "Österås IP",
      locationDetails: "Plan 7-manna 1",
      time: "10:00"
    },
    {
      name: "Match mot Vittsjö GIK (FALLBACK)",
      date: `${year}-01-19`,
      type: "match",
      location: "Österås IP",
      locationDetails: "Plan 7-manna 1",
      time: "11:30"
    }
  ];
}

// Convert scraped matches to activities
export function convertScrapedToActivities(
  scrapedMatches: ScrapedMatch[]
): Activity[] {
  return scrapedMatches.map(match => {
    const id = uuidv4();
    
    // Create activity with basic information
    const activity: Activity = {
      id: id,
      name: match.name,
      date: match.date,
      type: match.type,
      participants: [],
      scraped: true
    };
    
    // Add time if available
    if (match.time) {
      activity.time = match.time;
    }
    
    // Add location if available
    if (match.location) {
      activity.location = {
        name: match.location,
        description: match.locationDetails,
        gpsLink: generateFootballFieldUrl(match.location)
      };
    }
    
    return activity;
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
