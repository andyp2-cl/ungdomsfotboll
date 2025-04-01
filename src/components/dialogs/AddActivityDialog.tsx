
import React, { useState } from "react";
import { Activity, ActivityType } from "@/types/player";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AddActivityForm } from "@/components/AddActivityForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { CalendarPlus, FileText, Upload, RefreshCw } from "lucide-react";
import { CupMatch, CupMatchesForm } from "@/components/CupMatchesForm";
import { scrapeHifMatches, convertScrapedToActivities } from "@/utils/scraper";
import { generateFootballFieldUrl } from "@/utils/locationUtils";

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddActivity: (activity: Activity) => void;
}

export function AddActivityDialog({ 
  open, 
  onOpenChange, 
  onAddActivity 
}: AddActivityDialogProps) {
  const [textInput, setTextInput] = useState("");
  const [activeTab, setActiveTab] = useState<"form" | "text" | "scraper" | "import">("form");
  const [cupMatches, setCupMatches] = useState<CupMatch[]>([]);
  const [showCupMatches, setShowCupMatches] = useState(false);
  const [cupDate, setCupDate] = useState("");
  const [scrapedMatches, setScrapedMatches] = useState<Activity[]>([]);
  const [isScrapingLoading, setIsScrapingLoading] = useState(false);
  const [scrapYear, setScrapYear] = useState(new Date().getFullYear().toString());
  const [scrapError, setScrapError] = useState<string | null>(null);
  const { toast } = useToast();

  const parseActivitiesFromContent = (content: string): Activity[] => {
    try {
      const lines = content.split('\n').filter(line => line.trim().length > 0);
      const activities: Activity[] = [];
      
      let currentMonth = "";
      let currentYear = new Date().getFullYear().toString();
      let currentDate = "";
      let currentTime = "";
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.match(/^[A-Za-zåäöÅÄÖ]+$/)) {
          currentMonth = line;
          continue;
        }
        
        const dateMatch = line.match(/^([A-Za-zåäöÅÄÖ]+)\s+(\d+)$/);
        if (dateMatch) {
          const day = dateMatch[2].padStart(2, '0');
          const monthMap: {[key: string]: string} = {
            "Januari": "01", "Februari": "02", "Mars": "03", "April": "04",
            "Maj": "05", "Juni": "06", "Juli": "07", "Augusti": "08",
            "September": "09", "Oktober": "10", "November": "11", "December": "12",
            "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", 
            "Jun": "06", "Jul": "07", "Aug": "08", 
            "Sep": "09", "Okt": "10", "Nov": "11", "Dec": "12"
          };
          
          const monthNumber = monthMap[currentMonth] || "01";
          currentDate = `${currentYear}-${monthNumber}-${day}`;
          continue;
        }
        
        // Check if this is a time line (e.g. "09:30")
        const timeMatch = line.match(/^(\d{2}:\d{2})$/);
        if (timeMatch && currentDate) {
          currentTime = timeMatch[1];
          continue;
        }
        
        // Check if this is a match line (starts with dash)
        const matchLineMatch = line.match(/^-(.+)$/);
        if (matchLineMatch && currentDate && currentTime) {
          const matchName = matchLineMatch[1].trim();
          
          let location = "";
          let locationDesc = "";
          
          if (i + 1 < lines.length && !lines[i + 1].match(/^-|^(\d{2}:\d{2})$/) && !lines[i + 1].match(/^[A-Za-zåäöÅÄÖ]+\s+\d+$/) && !lines[i + 1].match(/^[A-Za-zåäöÅÄÖ]+$/)) {
            const locationLine = lines[i + 1].trim();
            
            const locationParts = locationLine.split(/\s+(?=[A-Za-zåäöÅÄÖ]-plan)/);
            
            if (locationParts.length > 1) {
              location = locationParts[0].trim();
              locationDesc = locationParts[1].trim();
            } else {
              location = locationLine;
            }
            
            i++;
          }
          
          const type = matchName.toLowerCase().includes('cup') ? 'cup' : 'match';
          
          const activity: Activity = {
            id: uuidv4(),
            name: matchName,
            date: currentDate,
            time: currentTime,
            type: type,
            participants: [],
          };
          
          if (location) {
            activity.location = {
              name: location,
              description: locationDesc,
              gpsLink: generateFootballFieldUrl(location)
            };
          }
          
          activities.push(activity);
          
          // Reset current time for the next match
          currentTime = "";
        }
      }
      
      return activities;
    } catch (error) {
      console.error("Error parsing activities:", error);
      return [];
    }
  };

  const handleSubmitText = () => {
    if (!textInput.trim()) {
      toast({
        variant: "destructive",
        title: "Tomt textfält",
        description: "Vänligen ange aktivitetsdata i textfältet.",
      });
      return;
    }

    const activities = parseActivitiesFromContent(textInput);
    
    if (activities.length === 0) {
      toast({
        variant: "destructive",
        title: "Kunde inte tolka data",
        description: "Inga giltiga aktiviteter hittades i texten. Kontrollera formatet.",
      });
      return;
    }

    for (const activity of activities) {
      onAddActivity(activity);
    }
    
    setTextInput("");
    
    toast({
      title: "Aktiviteter tillagda",
      description: `${activities.length} aktiviteter har lagts till.`,
    });
    
    onOpenChange(false);
  };

  const handleActivityFormSave = (activity: Activity) => {
    if (activity.type === "cup" && showCupMatches && cupMatches.length > 0) {
      const cupActivity: Activity = {
        ...activity,
        matches: []
      };
      
      const matchActivities: Activity[] = cupMatches.map(match => ({
        id: match.id,
        name: match.name,
        date: activity.date,
        type: "match" as const,
        time: match.time,
        location: match.location ? {
          name: match.location,
          description: match.locationDescription,
          gpsLink: generateFootballFieldUrl(match.location)
        } : undefined,
        participants: [],
        cupId: cupActivity.id
      }));
      
      cupActivity.matches = matchActivities.map(match => match.id);
      
      onAddActivity(cupActivity);
      
      matchActivities.forEach(matchActivity => {
        onAddActivity(matchActivity);
      });
      
      toast({
        title: "Cup och matcher tillagda",
        description: `${activity.name} och ${matchActivities.length} matcher har lagts till.`,
      });
    } else {
      onAddActivity(activity);
    }
    
    setCupMatches([]);
    setShowCupMatches(false);
    setCupDate("");
    onOpenChange(false);
  };

  const handleActivityTypeChange = (type: ActivityType) => {
    setShowCupMatches(type === "cup");
  };

  const handleActivityDateChange = (date: string) => {
    setCupDate(date);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (!content) throw new Error("Kunde inte läsa filinnehållet");

        const activities = parseActivitiesFromContent(content);

        if (activities.length === 0) {
          toast({
            variant: "destructive",
            title: "Fel vid import",
            description: "Inga giltiga aktiviteter hittades i filen.",
          });
        } else {
          activities.forEach(activity => {
            onAddActivity(activity);
          });
          
          toast({
            title: "Import slutförd",
            description: `${activities.length} aktiviteter har importerats.`,
          });
          
          onOpenChange(false);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Fel vid import",
          description: "Ett fel uppstod vid import av aktiviteter.",
        });
        console.error("Error importing activities:", error);
      } finally {
        // Reset file input
        event.target.value = '';
      }
    };

    reader.onerror = () => {
      toast({
        variant: "destructive",
        title: "Fel vid import",
        description: "Kunde inte läsa filen.",
      });
    };

    reader.readAsText(file);
  };

  const handleScrape = async () => {
    setIsScrapingLoading(true);
    setScrapError(null);
    setScrapedMatches([]);
    
    try {
      const matches = await scrapeHifMatches(scrapYear);
      
      if (matches.length === 0) {
        setScrapError(`Inga matcher hittades för ${scrapYear}`);
        toast({
          variant: "destructive",
          title: "Inga matcher hittades",
          description: `Kunde inte hitta några matcher för ${scrapYear}.`,
        });
        return;
      }
      
      const activities = convertScrapedToActivities(matches);
      setScrapedMatches(activities);
      toast({
        title: "Matcher hittade",
        description: `Hittade ${activities.length} matcher för ${scrapYear}.`,
      });
    } catch (err) {
      setScrapError((err as Error).message || "Misslyckades med att skrapa matcher");
      toast({
        variant: "destructive",
        title: "Fel",
        description: "Misslyckades med att skrapa matcher. Se detaljer för mer information.",
      });
    } finally {
      setIsScrapingLoading(false);
    }
  };

  const handleImportScraped = () => {
    if (scrapedMatches.length) {
      scrapedMatches.forEach(match => {
        onAddActivity(match);
      });
      
      toast({
        title: "Matcher importerade",
        description: `${scrapedMatches.length} matcher har importerats.`,
      });
      
      setScrapedMatches([]);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        setCupMatches([]);
        setShowCupMatches(false);
        setCupDate("");
        setScrapedMatches([]);
        setScrapError(null);
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lägg till aktivitet</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "form" | "text" | "scraper" | "import")}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="form" className="flex items-center gap-2">
              <CalendarPlus className="h-4 w-4" />
              Formulär
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Textformat
            </TabsTrigger>
            <TabsTrigger value="scraper" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Importera
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Fil
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="form">
            <AddActivityForm 
              onSave={handleActivityFormSave}
              onCancel={() => onOpenChange(false)}
              onTypeChange={handleActivityTypeChange}
              onDateChange={handleActivityDateChange}
            />
            
            {showCupMatches && (
              <div className="mt-4 pt-4 border-t">
                <CupMatchesForm 
                  cupDate={cupDate}
                  onMatchesChange={setCupMatches}
                />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="text">
            <DialogDescription className="pt-2 pb-4">
              Ange aktivitetsdata i följande format:
              <pre className="bg-muted p-2 rounded text-xs mt-1 overflow-x-auto">
{`April
Lör 12
09:30
-Hässleholms IF svart - Vinslövs IF
Österås IP F-plan 7-manna 1
13:00
-Hässleholms IF svart - Hörby FF
Österås IP F-plan 7-manna 2`}
              </pre>
            </DialogDescription>
            
            <Textarea 
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Klistra in aktivitetsdata här..."
              className="min-h-[150px] font-mono text-sm"
            />
            
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Avbryt
              </Button>
              <Button onClick={handleSubmitText}>
                Lägg till
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="scraper">
            <div className="space-y-4">
              <DialogDescription>
                Importera matcher från kalendern automatiskt. 
              </DialogDescription>
              
              <div className="flex gap-2">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={scrapYear}
                  onChange={(e) => setScrapYear(e.target.value)}
                >
                  {[new Date().getFullYear(), new Date().getFullYear() + 1].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <Button onClick={handleScrape} disabled={isScrapingLoading}>
                  {isScrapingLoading ? "Hämtar..." : "Hämta matcher"}
                </Button>
              </div>
              
              {scrapError && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                  {scrapError}
                </div>
              )}
              
              {scrapedMatches.length > 0 && (
                <>
                  <div className="bg-green-50 border border-green-200 p-3 rounded-md">
                    <p className="font-medium">Hittade {scrapedMatches.length} matcher</p>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                    <ul className="space-y-2">
                      {scrapedMatches.map((match, idx) => (
                        <li key={idx} className="text-sm border-b pb-1 last:border-0 last:pb-0">
                          <div className="font-medium">{match.name}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(match.date).toLocaleDateString('sv-SE')} {match.time}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => onOpenChange(false)}
                    >
                      Avbryt
                    </Button>
                    <Button onClick={handleImportScraped}>
                      Importera alla
                    </Button>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="import">
            <div className="space-y-4">
              <DialogDescription>
                Importera aktiviteter från en textfil i samma format som i textfliken.
              </DialogDescription>
              
              <div className="flex items-center justify-center w-full">
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Klicka för att ladda upp</span> eller dra och släpp
                    </p>
                    <p className="text-xs text-muted-foreground">TXT (Textfil)</p>
                  </div>
                  <input 
                    id="file-upload" 
                    type="file" 
                    accept=".txt" 
                    className="hidden" 
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  Stäng
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
