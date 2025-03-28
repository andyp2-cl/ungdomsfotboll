
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { scrapeHifMatches, convertScrapedToActivities } from "@/utils/scraper";
import { Activity } from "@/types/player";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface MatchScraperProps {
  onMatchesScraped?: (newActivities: Activity[]) => void;
}

export function MatchScraper({ onMatchesScraped }: MatchScraperProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedMatches, setScrapedMatches] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState("2025");
  const { toast } = useToast();

  const handleScrape = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const matches = await scrapeHifMatches(year);
      const activities = convertScrapedToActivities(matches);
      setScrapedMatches(activities);
      toast({
        title: "Matches scraped successfully",
        description: `Found ${activities.length} matches.`,
      });
    } catch (err) {
      setError((err as Error).message || "Failed to scrape matches");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to scrape matches. See details for more information.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    if (scrapedMatches.length && onMatchesScraped) {
      onMatchesScraped(scrapedMatches);
      toast({
        title: "Matches imported",
        description: `${scrapedMatches.length} matches have been imported.`,
      });
      setScrapedMatches([]);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Match Data Scraper</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleScrape} 
            disabled={isLoading}
            className="min-w-28"
          >
            {isLoading ? "Scraping..." : "Scrape Matches"}
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {scrapedMatches.length > 0 && (
          <>
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Scraped successfully</AlertTitle>
              <AlertDescription>
                Found {scrapedMatches.length} matches for {year}
              </AlertDescription>
            </Alert>
            
            <div className="max-h-60 overflow-y-auto border rounded-md p-2">
              <ul className="space-y-2">
                {scrapedMatches.map((match, idx) => (
                  <li key={idx} className="text-sm">
                    {match.name} - {new Date(match.date).toLocaleDateString('sv-SE')}
                  </li>
                ))}
              </ul>
            </div>
            
            <Button 
              onClick={handleImport} 
              variant="outline" 
              className="w-full"
            >
              Import {scrapedMatches.length} Matches
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
