
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

  const parseActivityLine = (line: string): Activity | null => {
    try {
      // Expected format: Name;Date;Time;Type;Location;LocationDescription
      const parts = line.split(';');
      if (parts.length < 3) return null;

      const name = parts[0]?.trim();
      const dateString = parts[1]?.trim();
      const timeString = parts[2]?.trim();
      const type: ActivityType = (parts[3]?.trim().toLowerCase() === 'cup') ? 'cup' : 'match';
      const locationName = parts[4]?.trim() || undefined;
      const locationDesc = parts[5]?.trim() || undefined;

      if (!name || !dateString) return null;

      // Create the activity object
      const activity: Activity = {
        id: uuidv4(),
        name,
        date: dateString,
        time: timeString || undefined,
        type,
        participants: [],
      };

      // Add location if available
      if (locationName) {
        activity.location = {
          name: locationName,
          description: locationDesc,
          gpsLink: generateFootballFieldUrl(locationName)
        };
      }

      return activity;
    } catch (error) {
      console.error("Error parsing activity line:", line, error);
      return null;
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

        const lines = content.split('\n').filter(line => line.trim().length > 0);
        const activities: Activity[] = [];

        for (const line of lines) {
          const activity = parseActivityLine(line);
          if (activity) activities.push(activity);
        }

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
          Ladda upp en textfil med aktiviteter. Varje rad bör ha formatet: 
          <br />
          <code className="bg-muted p-1 rounded text-xs">
            Namn;Datum(YYYY-MM-DD);Tid(HH:MM);Typ(match/cup);Plats;Platsbeskrivning
          </code>
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
