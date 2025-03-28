
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Image, AlertCircle } from "lucide-react";
import { Player } from "@/types/player";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { scrapePlayerImages } from "@/utils/scraper";

interface PlayerImageScraperProps {
  onImagesScraped: (playersWithImages: Player[]) => void;
  players: Player[];
}

// Available CORS proxy options
const corsProxies = [
  { value: "corsproxy", label: "corsproxy.io", url: "https://corsproxy.io/?" },
  { value: "allorigins", label: "allorigins.win", url: "https://api.allorigins.win/raw?url=" },
  { value: "cors-anywhere", label: "cors-anywhere.herokuapp.com", url: "https://cors-anywhere.herokuapp.com/" },
  { value: "thingproxy", label: "thingproxy.freeboard.io", url: "https://thingproxy.freeboard.io/fetch/" },
  { value: "direct", label: "Direktanslutning (utan proxy)", url: "" }
];

export function PlayerImageScraper({ onImagesScraped, players }: PlayerImageScraperProps) {
  const [url, setUrl] = useState("https://www.hassleholmsif.se/hassleholmsif-fotboll-p2014/truppen");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proxyIndex, setProxyIndex] = useState(0);
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
      const selectedProxy = corsProxies[proxyIndex];
      console.log(`Trying to fetch with proxy: ${selectedProxy.label}`);
      
      // Use the scraper utility function
      const updatedPlayers = await scrapePlayerImages(url, players, selectedProxy.url);
      
      if (updatedPlayers.length === players.length) {
        const matchCount = updatedPlayers.filter(p => p.image).length;
        
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
      }
    } catch (error) {
      console.error("Error scraping player images:", error);
      const errorMessage = error instanceof Error ? error.message : "Ett fel uppstod vid hämtning av spelarbilder.";
      setError(`${errorMessage}. Prova en annan proxy-server.`);
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
          
          <div className="grid gap-2">
            <Label htmlFor="proxy">Proxy-server</Label>
            <Select 
              value={proxyIndex.toString()} 
              onValueChange={(value) => setProxyIndex(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Välj proxy-server" />
              </SelectTrigger>
              <SelectContent>
                {corsProxies.map((proxy, index) => (
                  <SelectItem key={proxy.value} value={index.toString()}>
                    {proxy.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Om en proxy inte fungerar, prova en annan
            </p>
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
              <li>https://hassleholmsif.se/laget/</li>
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
