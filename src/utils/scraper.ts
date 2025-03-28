
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
export async function scrapePlayerImages(
  url: string, 
  players: Player[], 
  proxyUrl: string = "https://corsproxy.io/?"
): Promise<Player[]> {
  try {
    // Use the specified proxy to fetch the webpage
    const fetchUrl = proxyUrl ? `${proxyUrl}${encodeURIComponent(url)}` : url;
    console.log(`Fetching page from: ${fetchUrl}`);
    
    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'User-Agent': 'Mozilla/5.0 (compatible; PlayerImageScraper/1.0)'
      },
      mode: 'cors',
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Kunde inte hämta sidan (${response.status}): ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log(`Received HTML content of length: ${html.length}`);
    
    if (html.length < 1000) {
      console.warn("Warning: Received very short HTML content. Might be an error page.");
      if (html.includes("Ett fel har inträffat") || html.includes("error")) {
        throw new Error("Servern returnerade ett felmeddelande. Prova en annan URL eller proxy.");
      }
    }
    
    // Parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    
    // Try various selectors that might contain player information
    const selectors = [
      ".player-card", ".team-member", ".roster-player", ".player-profile",
      ".members-list > div", ".team-list > div", ".roster > div",
      ".player", ".member", "article.player", "article.member",
      ".sv-text-portlet-content", ".sv-channel-content > div", 
      ".sv-layout-portlet",
      "div.sv-layout__item", "div.sv-text-portlet",
      "div.sv-layout-portlet-content",
      ".sv-fluid-grid__item",
      "[class*='player']", "[class*='member']", "[class*='team']",
      "[class*='roster']", 
      "div:has(img):has(h3)",
      "div:has(img):has(.player-name)",
      ".sv-text-portlet-content",
      // More general selectors
      ".sv-layout > div",
      ".container div",
      "article",
      // Try to find images with nearby text that could be names
      "img + p", 
      "img + div",
      "figure", 
      "figure > figcaption",
      "figcaption",
      // Very general fallback
      "div:has(img)",
      // The most general fallback
      "img"
    ];
    
    let playerElements: NodeListOf<Element> | null = null;
    let usedSelector = "";
    
    // Try more aggressive approaches to find players in case the standard selectors fail
    for (const selector of selectors) {
      try {
        const elements = doc.querySelectorAll(selector);
        if (elements && elements.length > 0) {
          console.log(`Found ${elements.length} elements with selector: ${selector}`);
          playerElements = elements;
          usedSelector = selector;
          break;
        }
      } catch (e) {
        console.warn(`Selector "${selector}" caused an error:`, e);
        // Continue with next selector
      }
    }
    
    if (!playerElements || playerElements.length === 0) {
      throw new Error("Inga spelare eller bilder hittades på sidan. Prova en annan webbadress.");
    }
    
    const updatedPlayers: Player[] = [...players];
    let matchCount = 0;
    
    // Process each element to extract player information
    Array.from(playerElements).forEach((element, index) => {
      try {
        // Different handling based on what selector matched
        if (usedSelector === "img") {
          // We're directly looking at image elements
          const imgElement = element as HTMLImageElement;
          let imgSrc = imgElement.getAttribute("src");
          if (!imgSrc) return;
          
          // Skip small icons, logo images, etc.
          const imgWidth = imgElement.width || 0;
          const imgHeight = imgElement.height || 0;
          
          if ((imgWidth > 0 && imgWidth < 30) || (imgHeight > 0 && imgHeight < 30)) {
            return; // Skip tiny images
          }
          
          // Skip images that are likely to be logos or icons
          if (imgSrc.includes("logo") || imgSrc.includes("icon") || 
              imgSrc.includes("banner") || imgSrc.includes("header")) {
            return;
          }
          
          // Try to find nearby text for the name
          let playerName: string | null = null;
          
          // Check alt text first
          const altText = imgElement.getAttribute("alt");
          if (altText && altText.length > 3 && !altText.includes("logo") && !altText.includes("banner")) {
            playerName = altText;
          }
          
          // Check next sibling
          if (!playerName) {
            let nextSibling = imgElement.nextElementSibling;
            while (nextSibling && !playerName) {
              if (nextSibling.textContent) {
                const text = nextSibling.textContent.trim();
                if (text.length > 3 && text.length < 50) {
                  playerName = text;
                }
              }
              nextSibling = nextSibling.nextElementSibling;
            }
          }
          
          // Check parent's text content
          if (!playerName) {
            const parent = imgElement.parentElement;
            if (parent && parent.textContent) {
              const text = parent.textContent.trim();
              // Try to extract a potential name (avoid too short or too long text)
              if (text.length > 3 && text.length < 50) {
                playerName = text.split('\n')[0].trim();
              }
            }
          }
          
          // Check for figures with figcaptions
          if (!playerName && imgElement.closest('figure')) {
            const figure = imgElement.closest('figure');
            const figcaption = figure?.querySelector('figcaption');
            if (figcaption && figcaption.textContent) {
              playerName = figcaption.textContent.trim();
            }
          }
          
          if (!playerName) return;
          
          // Make the image URL absolute
          if (imgSrc.startsWith('/')) {
            try {
              const urlObj = new URL(url);
              imgSrc = `${urlObj.origin}${imgSrc}`;
            } catch (e) {
              // If the URL is invalid, try to make a best guess
              if (url.includes('://')) {
                const baseUrl = url.split('/').slice(0, 3).join('/');
                imgSrc = `${baseUrl}${imgSrc}`;
              }
            }
          } else if (!imgSrc.startsWith('http')) {
            try {
              const urlObj = new URL(url);
              imgSrc = `${urlObj.origin}/${imgSrc}`;
            } catch (e) {
              // If the URL is invalid, try to make a best guess
              if (url.includes('://')) {
                const baseUrl = url.split('/').slice(0, 3).join('/');
                imgSrc = `${baseUrl}/${imgSrc}`;
              }
            }
          }
          
          console.log(`Found potential player: ${playerName} with image: ${imgSrc}`);
          
          // Match with our database
          if (matchPlayerWithImage(updatedPlayers, playerName, imgSrc)) {
            matchCount++;
          }
        } else {
          // Try to find player name with various selectors
          let playerName: string | null = null;
          const nameSelectors = ['h3', 'h4', '.player-name', '.name', 'strong', 'b', 'p', 'span', 'figcaption', '.player-title'];
          
          for (const selector of nameSelectors) {
            try {
              const nameElement = element.querySelector(selector);
              if (nameElement && nameElement.textContent) {
                const text = nameElement.textContent.trim();
                if (text.length > 3 && text.length < 50) {
                  playerName = text;
                  console.log(`Found player name: ${playerName}`);
                  break;
                }
              }
            } catch (e) {
              // Continue to next selector
            }
          }
          
          // If no name found with selectors, try the element's own text
          if (!playerName && element.textContent) {
            const text = element.textContent.trim();
            if (text.length > 3 && text.length < 50) {
              playerName = text.split('\n')[0].trim();
            }
          }
          
          if (!playerName) return;
          
          // Find player image
          let imgElement: Element | null = null;
          try {
            imgElement = element.querySelector("img");
          } catch (e) {
            // If querySelector fails, try a different approach
            const imgs = element.getElementsByTagName("img");
            if (imgs.length > 0) {
              imgElement = imgs[0];
            }
          }
          
          if (!imgElement) return;
          
          let imgSrc = imgElement.getAttribute("src");
          if (!imgSrc) return;
          
          // Make the image URL absolute if it's relative
          if (imgSrc.startsWith('/')) {
            try {
              const urlObj = new URL(url);
              imgSrc = `${urlObj.origin}${imgSrc}`;
            } catch (e) {
              // If the URL is invalid, try to make a best guess
              if (url.includes('://')) {
                const baseUrl = url.split('/').slice(0, 3).join('/');
                imgSrc = `${baseUrl}${imgSrc}`;
              }
            }
          } else if (!imgSrc.startsWith('http')) {
            try {
              const urlObj = new URL(url);
              imgSrc = `${urlObj.origin}/${imgSrc}`;
            } catch (e) {
              // If the URL is invalid, try to make a best guess
              if (url.includes('://')) {
                const baseUrl = url.split('/').slice(0, 3).join('/');
                imgSrc = `${baseUrl}/${imgSrc}`;
              }
            }
          }
          
          console.log(`Found image for ${playerName}: ${imgSrc}`);
          
          // Match with our database
          if (matchPlayerWithImage(updatedPlayers, playerName, imgSrc)) {
            matchCount++;
          }
        }
      } catch (e) {
        console.error("Error processing element:", e);
        // Continue with next element
      }
    });
    
    function matchPlayerWithImage(players: Player[], name: string, imgSrc: string): boolean {
      // Skip names that are too generic or likely errors
      if (name.includes("Error") || 
          name.includes("Fel") || 
          name.includes("404") || 
          name.length < 3 || 
          name.length > 50) {
        return false;
      }
      
      // Clean the name - remove extra spaces, newlines, and common titles
      name = name.replace(/\s+/g, ' ')
                .replace(/\n/g, ' ')
                .replace(/^\s+|\s+$/g, '')
                .replace(/^(herr|dam|pojk|flicka|p\d+|f\d+|u\d+)[\s\-]+/i, '')
                .replace(/^(tränare|coach|ledare|manager)[\s\-]+/i, '');
      
      // First try exact name match
      let playerIndex = players.findIndex(
        p => p.name.toLowerCase() === name.toLowerCase()
      );
      
      // If not found, try with first and last name separately
      if (playerIndex === -1 && name.includes(' ')) {
        const nameParts = name.split(' ');
        const firstName = nameParts[0].toLowerCase();
        const lastName = nameParts[nameParts.length - 1].toLowerCase();
        
        // Try matching with first name
        playerIndex = players.findIndex(
          p => p.name.toLowerCase().includes(firstName)
        );
        
        // If still not found, try with last name
        if (playerIndex === -1 && lastName.length > 2) {
          playerIndex = players.findIndex(
            p => p.name.toLowerCase().includes(lastName)
          );
        }
      }
      
      // If still not found, try with any part of the name
      if (playerIndex === -1) {
        const playerWords = name.toLowerCase().split(/\s+/);
        for (const word of playerWords) {
          if (word.length > 3) { // Only use words longer than 3 chars
            playerIndex = players.findIndex(
              p => p.name.toLowerCase().includes(word)
            );
            if (playerIndex !== -1) break;
          }
        }
      }
      
      // If still not found, check if any player name is contained in this name
      if (playerIndex === -1) {
        playerIndex = players.findIndex(
          p => name.toLowerCase().includes(p.name.toLowerCase())
        );
      }
      
      if (playerIndex >= 0) {
        players[playerIndex] = {
          ...players[playerIndex],
          image: imgSrc,
        };
        console.log(`Matched player: ${name} with ${players[playerIndex].name}`);
        return true;
      }
      
      return false;
    }
    
    if (matchCount === 0) {
      throw new Error("Inga spelare från webbplatsen matchade med din laglista. Prova en annan URL.");
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
