
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Image, AlertCircle } from "lucide-react";
import { Player } from "@/types/player";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PlayerImageScraperProps {
  onImagesScraped: (playersWithImages: Player[]) => void;
  players: Player[];
}

export function PlayerImageScraper({ onImagesScraped, players }: PlayerImageScraperProps) {
  const [url, setUrl] = useState("https://www.hassleholmsif.se/hassleholmsif-fotboll-p2014/truppen");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleScrape = async () => {
    if (!url) {
      toast({
        title: "URL saknas",
        description: "Ange en URL att hämta spelarbilder från.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch the webpage content
      const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error(`Kunde inte hämta sidan (${response.status}): ${response.statusText}`);
      }
      
      const html = await response.text();
      console.log("Received HTML length:", html.length);
      
      // Create a temporary DOM element to parse the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      
      // Try multiple selector patterns commonly used on sports team websites
      let playerElements: NodeListOf<Element> | null = null;
      const selectors = [
        // Original selector
        ".sv-channel-content > div", 
        // Common patterns on team roster pages
        ".player-card", 
        ".team-member",
        ".roster-player",
        ".player-profile",
        // Generic containers that might hold player info
        ".members-list > div",
        ".team-list > div",
        ".roster > div",
        // More general - try to find players by looking for their images and names
        "div:has(img):has(h3)",
        "div:has(img):has(.player-name)",
        // Try to find any div containing both an image and text that might be a player
        "div.sv-text-portlet-content"
      ];
      
      for (const selector of selectors) {
        const elements = doc.querySelectorAll(selector);
        if (elements && elements.length > 0) {
          console.log(`Found ${elements.length} elements with selector: ${selector}`);
          playerElements = elements;
          break;
        }
      }
      
      if (!playerElements || playerElements.length === 0) {
        console.error("No player elements found with any selector");
        throw new Error("Inga spelare hittades på sidan. Prova en annan URL eller kontakta support.");
      }
      
      console.log(`Found ${playerElements.length} potential player elements on the page`);
      
      const updatedPlayers: Player[] = [...players];
      let matchCount = 0;
      
      Array.from(playerElements).forEach((element, index) => {
        // Try to find the name in various possible locations
        let playerName: string | null = null;
        const nameSelectors = ['h3', 'h4', '.player-name', '.name', 'strong', 'b', 'p'];
        
        for (const selector of nameSelectors) {
          const nameElement = element.querySelector(selector);
          if (nameElement && nameElement.textContent) {
            playerName = nameElement.textContent.trim();
            if (playerName) break;
          }
        }
        
        if (!playerName) {
          console.log(`No name found for element ${index}`);
          return;
        }
        
        console.log(`Found player: ${playerName}`);
        
        // Find player image
        const imgElement = element.querySelector("img");
        if (!imgElement) {
          console.log(`No image found for player: ${playerName}`);
          return;
        }
        
        let imgSrc = imgElement.getAttribute("src");
        if (!imgSrc) {
          console.log(`No image source for player: ${playerName}`);
          return;
        }
        
        // Make relative URLs absolute
        if (imgSrc.startsWith('/')) {
          const urlObj = new URL(url);
          imgSrc = `${urlObj.origin}${imgSrc}`;
        } else if (!imgSrc.startsWith('http')) {
          const urlObj = new URL(url);
          imgSrc = `${urlObj.origin}/${imgSrc}`;
        }
        
        console.log(`Found image for ${playerName}: ${imgSrc}`);

        // Find matching player in our database - try different name variations
        let playerIndex = updatedPlayers.findIndex(
          p => p.name.toLowerCase() === playerName.toLowerCase()
        );
        
        // If not found directly, try with first name only
        if (playerIndex === -1) {
          const firstName = playerName.split(' ')[0].toLowerCase();
          playerIndex = updatedPlayers.findIndex(
            p => p.name.toLowerCase().startsWith(firstName)
          );
        }
        
        if (playerIndex >= 0) {
          updatedPlayers[playerIndex] = {
            ...updatedPlayers[playerIndex],
            image: imgSrc,
          };
          matchCount++;
          console.log(`Matched player: ${playerName} with ${updatedPlayers[playerIndex].name}`);
        } else {
          console.log(`No match found for player: ${playerName}`);
        }
      });
      
      if (matchCount === 0) {
        setError("Inga spelare matchade. Kontrollera att lagnamnen stämmer överens.");
        toast({
          title: "Inga matcher hittades",
          description: "Inga av spelarna på webbsidan matchade spelarna i din databas.",
          variant: "destructive",
        });
        return;
      }
      
      onImagesScraped(updatedPlayers);
      
      toast({
        title: "Spelarbilder hämtade",
        description: `${matchCount} spelarbilder har hämtats och uppdaterats.`,
      });
    } catch (error) {
      console.error("Error scraping player images:", error);
      const errorMessage = error instanceof Error ? error.message : "Ett fel uppstod vid hämtning av spelarbilder.";
      setError(errorMessage);
      toast({
        title: "Kunde inte hämta spelarbilder",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Hämta spelarbilder</CardTitle>
        <CardDescription>
          Hämta spelarbilder från Hassleholms IF webbplats och uppdatera automatiskt.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="url">Webbadress</Label>
            <Input
              id="url"
              placeholder="https://www.hassleholmsif.se/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Fel</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="text-sm text-muted-foreground">
            <p>Tips: Prova dessa webbadresser om den aktuella inte fungerar:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>https://www.hassleholmsif.se/start/truppen</li>
              <li>https://www.hassleholmsif.se/start/vara-lag</li>
              <li>Sök efter lagsidan på Google och kopiera adressen</li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleScrape} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>Hämtar bilder...</>
          ) : (
            <>
              <Image className="h-4 w-4 mr-2" />
              Hämta spelarbilder
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
