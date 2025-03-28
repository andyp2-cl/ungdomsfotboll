
import { Activity, ActivityType } from "@/types/player";

interface ScrapedMatch {
  name: string;
  date: string;
  type: ActivityType;
}

export async function scrapeHifMatches(year: string = "2025"): Promise<ScrapedMatch[]> {
  try {
    // In a real implementation, we would use fetch or axios to get the page content
    // But due to CORS limitations in the browser, this would typically need to be done
    // from a backend service or using a CORS proxy
    
    // For demonstration, we'll show how the scraping logic would work
    // but will need to return mock data instead of actually scraping
    
    console.log(`Attempting to scrape matches for year ${year}...`);
    
    // Simulated response - in a real implementation, this would be replaced
    // with actual scraped data from the website
    const mockScrapedMatches: ScrapedMatch[] = [
      {
        name: "Match mot IFK Hässleholm svart (SCRAPE TEST)",
        date: `${year}-01-17`,
        type: "match",
      },
      {
        name: "Match mot Åhus Horna BK vit (SCRAPE TEST)",
        date: `${year}-01-19`,
        type: "match",
      },
      {
        name: "Match mot Vittsjö GIK (SCRAPE TEST)",
        date: `${year}-01-19`,
        type: "match",
      }
    ];
    
    return mockScrapedMatches;
  } catch (error) {
    console.error("Error scraping HIF matches:", error);
    throw new Error("Failed to scrape match data");
  }
}

// This function would convert scraped matches to our Activity format
export function convertScrapedToActivities(
  scrapedMatches: ScrapedMatch[]
): Activity[] {
  let nextId = Math.max(...mockActivityIds()) + 1;
  
  return scrapedMatches.map(match => {
    // Store current ID and then increment for next use
    const currentId = nextId;
    nextId++;
    
    return {
      id: currentId.toString(),
      name: match.name,
      date: match.date,
      type: match.type,
      participants: [],
      kioskScheduleId: nextId.toString() // Creating a related kiosk schedule
    };
  });
}

// Helper to get existing IDs to avoid conflicts
function mockActivityIds(): number[] {
  try {
    // In a real implementation, we'd import directly from mockData
    // but to avoid circular dependencies, we're using this approach
    const activityData = localStorage.getItem('mockActivities');
    if (activityData) {
      const activities = JSON.parse(activityData);
      return activities.map((act: Activity) => parseInt(act.id));
    }
    return [100]; // Fallback starting ID
  } catch (error) {
    console.error("Error getting activity IDs:", error);
    return [100]; // Fallback starting ID
  }
}
