
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Image, AlertCircle, RefreshCw } from "lucide-react";
import { Player } from "@/types/player";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { scrapePlayerImages } from "@/utils/scraper";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

// Predefined URLs that might work
const suggestedUrls = [
  "https://www.hassleholmsif.se/hassleholmsif-fotboll-p2014/truppen",
  "https://www.hassleholmsif.se/start/truppen",
  "https://hassleholmsif.se/laget/",
  "https://www.hassleholmsif.se/laglista",
  "https://www.svenskalag.se/hassleholmsif-fotbollp11/laginfo"
];

export function PlayerImageScraper({ onImagesScraped, players }: PlayerImageScraperProps) {
  const [url, setUrl] = useState("https://www.hassleholmsif.se/hassleholmsif-fotboll-p2014/truppen");
  const [customUrl, setCustomUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proxyIndex, setProxyIndex] = useState(0);
  const [urlType, setUrlType] = useState("predefined");
  const [activeTab, setActiveTab] = useState("url");
  const { toast } = useToast();

  useEffect(() => {
    if (urlType === "custom") {
      setUrl(customUrl);
    }
  }, [customUrl, urlType]);

  const handlePredefinedUrlChange = (value: string) => {
    setUrl(value);
  };

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

  const tryNextProxy = () => {
    // Automatically try the next proxy
    const nextProxyIndex = (proxyIndex + 1) % corsProxies.length;
    setProxyIndex(nextProxyIndex);
    toast({
      title: "Byter proxy",
      description: `Provar med ${corsProxies[nextProxyIndex].label}`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Hämta spelarbilder</CardTitle>
        <CardDescription>
          Hämta spelarbilder från lagets webbplats och uppdatera automatiskt.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="url">Webbadress</TabsTrigger>
            <TabsTrigger value="proxy">Proxy Server</TabsTrigger>
          </TabsList>
          
          <TabsContent value="url">
            <div className="grid gap-2 mb-4">
              <RadioGroup
                defaultValue="predefined"
                value={urlType}
                onValueChange={setUrlType}
                className="mb-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="predefined" id="predefined" />
                  <Label htmlFor="predefined">Använd fördefinierad URL</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom">Använd egen URL</Label>
                </div>
              </RadioGroup>
              
              {urlType === "predefined" ? (
                <div className="grid gap-2">
                  <Label htmlFor="url">Välj fördefinierad URL</Label>
                  <Select 
                    value={url} 
                    onValueChange={handlePredefinedUrlChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Välj webbadress" />
                    </SelectTrigger>
                    <SelectContent>
                      {suggestedUrls.map((suggestedUrl, index) => (
                        <SelectItem key={index} value={suggestedUrl}>
                          {suggestedUrl}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="custom-url">Egen webbadress</Label>
                  <Input
                    id="custom-url"
                    placeholder="https://..."
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                  />
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="proxy">
            <div className="grid gap-2 mb-4">
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
          </TabsContent>
        </Tabs>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Fel</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="text-sm text-muted-foreground">
          <p>Tips för att hitta spelarbilder:</p>
          <ul className="list-disc pl-5 mt-1">
            <li>Prova olika webbplatser som kan innehålla spelarbilder</li>
            <li>Sök efter lagnamnet på Google och kopiera webbsidans adress</li>
            <li>Testa flera proxy-servrar om en inte fungerar</li>
            <li>Det kan hjälpa att besöka webbsidan först i en vanlig webbläsare</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex-col space-y-2">
        <div className="flex space-x-2 w-full">
          <Button 
            onClick={handleScrape} 
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Hämtar bilder...
              </>
            ) : (
              <>
                <Image className="h-4 w-4 mr-2" />
                Hämta spelarbilder
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={tryNextProxy}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Om hämtningen misslyckas, prova med en annan URL eller proxy-server
        </p>
      </CardFooter>
    </Card>
  );
}
