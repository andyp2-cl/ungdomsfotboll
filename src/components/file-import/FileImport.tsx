
import { useState } from "react";
import { Activity } from "@/types/player";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { FileDown, FileUp, Table, AlertTriangle } from "lucide-react";
import { ImportFormatExample } from "./ImportFormatExample";
import { FileUploadArea } from "./FileUploadArea";
import { parseActivitiesFromContent } from "./parseActivities";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FileImportProps {
  onActivitiesImported: (activities: Activity[]) => void;
}

export function FileImport({ onActivitiesImported }: FileImportProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [importFormat, setImportFormat] = useState<"text" | "csv">("text");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (!content) throw new Error("Kunde inte läsa filinnehållet");

        let activities: Activity[] = [];
        
        // Check if file is CSV based on extension or content
        const isCSV = file.name.toLowerCase().endsWith('.csv') || content.includes(',') && content.includes('\n');
        
        if (isCSV) {
          activities = parseCSVContent(content);
        } else {
          activities = parseActivitiesFromContent(content);
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
  
  // Parse CSV content for activities
  const parseCSVContent = (content: string): Activity[] => {
    const lines = content.split('\n');
    if (lines.length <= 1) return [];
    
    // Get header row
    const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
    
    // Check for required columns
    const idIndex = headers.indexOf('id');
    const nameIndex = headers.indexOf('name');
    const dateIndex = headers.indexOf('date');
    const typeIndex = headers.indexOf('type');
    
    if (nameIndex === -1 || dateIndex === -1 || typeIndex === -1) {
      console.error("Required columns missing in CSV");
      return [];
    }
    
    const activities: Activity[] = [];
    
    // Start from 1 to skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(value => value.trim());
      
      // Create activity object
      const activity: Activity = {
        id: idIndex !== -1 ? values[idIndex] : crypto.randomUUID(),
        name: values[nameIndex],
        date: values[dateIndex],
        type: values[typeIndex] as any,
        participants: []
      };
      
      // Add optional fields
      const timeIndex = headers.indexOf('time');
      if (timeIndex !== -1 && values[timeIndex]) {
        activity.time = values[timeIndex];
      }
      
      const locationNameIndex = headers.indexOf('location_name');
      if (locationNameIndex !== -1 && values[locationNameIndex]) {
        activity.location = {
          name: values[locationNameIndex],
          description: '',
          gpsLink: ''
        };
        
        const locationDescIndex = headers.indexOf('location_description');
        if (locationDescIndex !== -1 && values[locationDescIndex]) {
          activity.location.description = values[locationDescIndex];
        }
        
        const locationGpsIndex = headers.indexOf('location_gps_link');
        if (locationGpsIndex !== -1 && values[locationGpsIndex]) {
          activity.location.gpsLink = values[locationGpsIndex];
        }
      }
      
      // Cup ID
      const cupIdIndex = headers.indexOf('cup_id');
      if (cupIdIndex !== -1 && values[cupIdIndex]) {
        activity.cupId = values[cupIdIndex];
      }
      
      activities.push(activity);
    }
    
    return activities;
  };

  const handleDownloadTemplate = () => {
    // Create CSV template
    const csvContent = "id,name,date,type,time,location_name,location_description,location_gps_link,cup_id\n" + 
                      "uuid-format,Exempel match,2024-05-01,match,13:00,Österås IP,F-plan 7-manna,https://maps.app.goo.gl/example,\n" + 
                      ",Annan match,2024-05-02,match,15:30,Österås IP,,,\n" +
                      ",Cup exempel,2024-05-10,cup,,,,";
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'aktiviteter_mall.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadExportInstructions = () => {
    // Create instructions
    const instructions = `
# Instruktioner för export från Supabase

För att exportera data från din live Supabase-miljö och importera till utvecklingsmiljön:

## Tabeller att exportera

1. activities - Innehåller alla aktiviteter (matcher, träningar, etc)
2. players - Innehåller alla spelare
3. player_activities - Kopplar ihop spelare med aktiviteter

## Steg för export

1. Logga in på Supabase Admin (https://supabase.com)
2. Välj ditt projekt
3. Gå till "Table Editor" i sidomenyn
4. Välj tabellen du vill exportera (activities, players, eller player_activities)
5. Klicka på "..." (tre punkter) längst till höger i tabellrubriken
6. Välj "Download CSV"
7. Upprepa för varje tabell

## Importera i utvecklingsmiljön

1. Använd verktyget på denna sida för att importera activities-tabellen
2. För players och player_activities, gå till Supabase i utvecklingsmiljön
3. Välj respektive tabell
4. Klicka på "Insert" och välj "Import data from CSV"

## Ordning för import (viktigt!)

1. Importera först players
2. Importera sedan activities
3. Importera sist player_activities

Detta säkerställer att alla relationer blir korrekta.
`;
    
    // Create and trigger download
    const blob = new Blob([instructions], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'supabase_exportera_instruktioner.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <FileUp className="h-5 w-5" />
          Importera från fil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <Button 
            variant={importFormat === "text" ? "default" : "outline"}
            size="sm"
            onClick={() => setImportFormat("text")}
          >
            Textformat
          </Button>
          <Button 
            variant={importFormat === "csv" ? "default" : "outline"}
            size="sm"
            onClick={() => setImportFormat("csv")}
          >
            CSV-format
          </Button>
        </div>
        
        {importFormat === "text" ? (
          <div>
            <p className="text-sm text-muted-foreground">
              Ladda upp en textfil med aktiviteter i följande format:
              <br />
              <ImportFormatExample />
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Ladda upp en CSV-fil exporterad från Supabase med följande kolumner:
            </p>
            <div className="bg-muted p-2 rounded text-xs mt-1 overflow-x-auto">
              <Table className="h-4 w-4 mr-1 inline-block" /> <code>id, name, date, type, time, location_name, location_description, location_gps_link, cup_id</code>
            </div>
            <div className="mt-2 flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadTemplate}
                className="text-xs"
              >
                <FileDown className="h-4 w-4 mr-1" /> Ladda ner CSV-mall
              </Button>
            </div>
          </div>
        )}
        
        <FileUploadArea 
          isLoading={isLoading} 
          onFileChange={handleFileUpload} 
          acceptTypes={importFormat === "csv" ? ".csv" : ".txt"}
          fileType={importFormat === "csv" ? "CSV" : "TXT"}
        />
        
        <Alert className="bg-blue-50 text-blue-800 border-blue-300 mt-4">
          <AlertTriangle className="h-4 w-4 text-blue-800" />
          <AlertDescription className="text-sm">
            För att importera all din data behöver du exportera från tre tabeller: activities, players och player_activities.
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadExportInstructions}
                className="text-xs border-blue-400 hover:bg-blue-100"
              >
                <FileDown className="h-4 w-4 mr-1" /> Ladda ner instruktioner
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="border-t pt-4 flex flex-col items-start">
        <p className="text-xs text-muted-foreground">
          <strong>Tips:</strong> För att exportera data från Supabase direkt, gå till Table Editor i Supabase Admin, välj tabellen och klicka på "..." och välj "Download CSV".
        </p>
      </CardFooter>
    </Card>
  );
}
