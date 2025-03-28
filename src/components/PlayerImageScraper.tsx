
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Image } from "lucide-react";
import { Player } from "@/types/player";
import { useToast } from "@/hooks/use-toast";

interface PlayerImageScraperProps {
  onImagesScraped: (playersWithImages: Player[]) => void;
  players: Player[];
}

export function PlayerImageScraper({ onImagesScraped, players }: PlayerImageScraperProps) {
  const [url, setUrl] = useState("https://www.hassleholmsif.se/hassleholmsif-fotboll-p2014/truppen");
  const [isLoading, setIsLoading] = useState(false);
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
    try {
      // Fetch the webpage content
      const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
      const html = await response.text();
      
      // Create a temporary DOM element to parse the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      
      // Find player elements - this selector needs to match the structure of the Hässleholms IF website
      const playerElements = doc.querySelectorAll(".sv-channel-content > div");
      
      if (!playerElements || playerElements.length === 0) {
        throw new Error("Inga spelare hittades på sidan");
      }
      
      const updatedPlayers: Player[] = [...players];
      let matchCount = 0;
      
      Array.from(playerElements).forEach(element => {
        // Extract player name and image
        const nameElement = element.querySelector("h3");
        if (!nameElement) return;
        
        const playerName = nameElement.textContent?.trim();
        if (!playerName) return;
        
        // Find player image
        const imgElement = element.querySelector("img");
        if (!imgElement) return;
        
        const imgSrc = imgElement.getAttribute("src");
        if (!imgSrc) return;

        // Find matching player in our database
        const playerIndex = updatedPlayers.findIndex(
          p => p.name.toLowerCase() === playerName.toLowerCase()
        );
        
        if (playerIndex >= 0) {
          updatedPlayers[playerIndex] = {
            ...updatedPlayers[playerIndex],
            image: imgSrc,
          };
          matchCount++;
        }
      });
      
      if (matchCount === 0) {
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
      toast({
        title: "Kunde inte hämta spelarbilder",
        description: error instanceof Error ? error.message : "Ett fel uppstod vid hämtning av spelarbilder.",
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
