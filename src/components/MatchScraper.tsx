
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { scrapeHifMatches, convertScrapedToActivities } from "@/utils/scraper";
import { Activity } from "@/types/player";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Calendar } from "lucide-react";
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
    setScrapedMatches([]);
    
    try {
      const matches = await scrapeHifMatches(year);
      
      if (matches.length === 0) {
        setError(`Inga matcher hittades för ${year}`);
        toast({
          variant: "destructive",
          title: "Inga matcher hittades",
          description: `Kunde inte hitta några matcher för ${year}.`,
        });
        return;
      }
      
      const activities = convertScrapedToActivities(matches);
      setScrapedMatches(activities);
      toast({
        title: "Matcher skrapade",
        description: `Hittade ${activities.length} matcher för ${year}.`,
      });
    } catch (err) {
      setError((err as Error).message || "Misslyckades med att skrapa matcher");
      toast({
        variant: "destructive",
        title: "Fel",
        description: "Misslyckades med att skrapa matcher. Se detaljer för mer information.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    if (scrapedMatches.length && onMatchesScraped) {
      onMatchesScraped(scrapedMatches);
      toast({
        title: "Matcher importerade",
        description: `${scrapedMatches.length} matcher har importerats.`,
      });
      setScrapedMatches([]);
    }
  };

  const currentYear = new Date().getFullYear();
  const availableYears = [
    currentYear.toString(),
    (currentYear + 1).toString(),
    (currentYear + 2).toString()
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Matchdata-skrapare
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger>
                <SelectValue placeholder="Välj år" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map(yearOption => (
                  <SelectItem key={yearOption} value={yearOption}>
                    {yearOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleScrape} 
            disabled={isLoading}
            className="min-w-28"
          >
            {isLoading ? "Skrapar..." : "Skrapa matcher"}
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Fel</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {scrapedMatches.length > 0 && (
          <>
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Skrapning lyckades</AlertTitle>
              <AlertDescription>
                Hittade {scrapedMatches.length} matcher för {year}
              </AlertDescription>
            </Alert>
            
            <div className="max-h-60 overflow-y-auto border rounded-md p-2">
              <ul className="space-y-2">
                {scrapedMatches.map((match, idx) => (
                  <li key={idx} className="text-sm border-b pb-1 last:border-0 last:pb-0">
                    <div className="font-medium">{match.name}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(match.date).toLocaleDateString('sv-SE')}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <Button 
              onClick={handleImport} 
              variant="outline" 
              className="w-full"
            >
              Importera {scrapedMatches.length} matcher
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
