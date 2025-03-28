
import { Activity, ActivityType } from "@/types/player";

interface ScrapedMatch {
  name: string;
  date: string;
  type: ActivityType;
}

export async function scrapeHifMatches(year: string = "2025"): Promise<ScrapedMatch[]> {
  try {
    // Eftersom vi kör i webbläsaren behöver vi använda en CORS proxy för att hämta data
    // Observera att detta är för demo och skulle normalt göras på servern
    const corsProxy = "https://corsproxy.io/?";
    const url = `${corsProxy}https://www.svenskalag.se/hessleholmsif-fotboll-p2016/kalender/${year}`;
    
    console.log(`Scraping HIF matches from ${url}...`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }
    
    const html = await response.text();
    console.log(`Received HTML of length: ${html.length}`);
    
    // Använd en regex för att extrahera matchinformation från HTML
    // Detta är ett förenklat exempel och skulle vara mer robust i en produktionsmiljö
    const matchRegex = /<div class="cal-event-item[^>]*>[^]*?<span class="cal-event-name-inner">([^<]+)<\/span>[^]*?<span class="cal-day">(\d+)<\/span>\s*<span class="cal-month">(\w+)<\/span>\s*<span class="cal-weekday">([^<]+)<\/span>[^]*?<\/div>/g;
    
    const months: Record<string, string> = {
      'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'maj': '05', 'jun': '06',
      'jul': '07', 'aug': '08', 'sep': '09', 'okt': '10', 'nov': '11', 'dec': '12'
    };
    
    const matches: ScrapedMatch[] = [];
    let match;
    
    while ((match = matchRegex.exec(html)) !== null) {
      const name = match[1].trim();
      const day = match[2].padStart(2, '0');
      const monthName = match[3].toLowerCase();
      const month = months[monthName] || '01'; // Default to January if not found
      const date = `${year}-${month}-${day}`;
      
      // Kontrollera om det är en match eller cup baserat på namnet
      const type: ActivityType = name.toLowerCase().includes('cup') ? 'cup' : 'match';
      
      matches.push({
        name,
        date,
        type
      });
    }
    
    console.log(`Found ${matches.length} matches`);
    
    // Om vi inte hittar några matcher med regexp (kanske på grund av ändringar i HTML-strukturen)
    // returnerar vi mock-data som fallback för demo-syften
    if (matches.length === 0) {
      console.warn("No matches found with regex, using fallback mock data");
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
    
    return matches;
  } catch (error) {
    console.error("Error scraping HIF matches:", error);
    // Vid fel returnerar vi också mock-data som fallback
    return [
      {
        name: "Match mot IFK Hässleholm svart (ERROR FALLBACK)",
        date: `${year}-01-17`,
        type: "match",
      },
      {
        name: "Match mot Åhus Horna BK vit (ERROR FALLBACK)",
        date: `${year}-01-19`,
        type: "match",
      },
      {
        name: "Match mot Vittsjö GIK (ERROR FALLBACK)",
        date: `${year}-01-19`,
        type: "match",
      }
    ];
  }
}

// Konvertera skrapade matcher till aktiviteter
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
