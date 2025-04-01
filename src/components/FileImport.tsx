
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileWarning } from "lucide-react";
import { Activity, ActivityType } from "@/types/player";
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { generateFootballFieldUrl } from "@/utils/locationUtils";

interface FileImportProps {
  onActivitiesImported: (activities: Activity[]) => void;
}

export function FileImport({ onActivitiesImported }: FileImportProps) {
  const [isLoading, setIsLoading] = useState(false);
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
        
        // Check if this is a month line
        if (line.match(/^[A-Za-zåäöÅÄÖ]+$/)) {
          currentMonth = line;
          continue;
        }
        
        // Check if this is a date line (e.g. "Lör 12")
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
          
          const monthNumber = monthMap[currentMonth] || "01"; // Default to January if unknown
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
          
          // Get location from next line if available
          let location = "";
          let locationDesc = "";
          
          if (i + 1 < lines.length && !lines[i + 1].match(/^-|^(\d{2}:\d{2})$/) && !lines[i + 1].match(/^[A-Za-zåäöÅÄÖ]+\s+\d+$/) && !lines[i + 1].match(/^[A-Za-zåäöÅÄÖ]+$/)) {
            const locationLine = lines[i + 1].trim();
            
            // Try to split location and description if possible
            const locationParts = locationLine.split(/\s+(?=[A-Za-zåäöÅÄÖ]-plan)/);
            
            if (locationParts.length > 1) {
              location = locationParts[0].trim();
              locationDesc = locationParts[1].trim();
            } else {
              location = locationLine;
            }
            
            i++; // Skip the location line in the next iteration
          }
          
          // Determine if it's a cup or match
          const type: ActivityType = matchName.toLowerCase().includes('cup') ? 'cup' : 'match';
          
          // Create activity object
          const activity: Activity = {
            id: uuidv4(),
            name: matchName,
            date: currentDate,
            time: currentTime,
            type: type,
            participants: [],
          };
          
          // Add location if available
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

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
          onActivitiesImported(activities);
          toast({
            title: "Import slutförd",
            description: `${activities.length} aktiviteter har importerats.`,
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Fel vid import",
          description: "Ett fel uppstod vid import av aktiviteter.",
        });
        console.error("Error importing activities:", error);
      } finally {
        setIsLoading(false);
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
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importera från fil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Ladda upp en textfil med aktiviteter i följande format:
          <br />
          <pre className="bg-muted p-2 rounded text-xs mt-1 whitespace-pre-wrap">
{`April
Lör 12
09:30
-Hässleholms IF svart - Vinslövs IF
Österås IP F-plan 7-manna 1
13:00
-Hässleholms IF svart - Hörby FF
Österås IP F-plan 7-manna 2`}
          </pre>
        </p>
        
        <div className="flex items-center justify-center w-full">
          <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {isLoading ? (
                <div className="mb-3 text-center">
                  <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Importerar...</p>
                </div>
              ) : (
                <>
                  <FileWarning className="w-8 h-8 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Klicka för att ladda upp</span> eller dra och släpp
                  </p>
                  <p className="text-xs text-muted-foreground">TXT (Textfil)</p>
                </>
              )}
            </div>
            <input 
              id="file-upload" 
              type="file" 
              accept=".txt" 
              className="hidden" 
              onChange={handleFileUpload}
              disabled={isLoading}
            />
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
