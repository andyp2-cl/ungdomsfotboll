
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { ArrowDownToLine, ExternalLink, AlertCircle, Info, DownloadCloud } from "lucide-react";
import { importFromLiveEnv } from "@/utils/storage/backup/restore-activities/import-live";
import { Activity } from "@/types/player";

interface ImportFromLiveFormProps {
  onImportedActivities?: (activities: Activity[]) => Promise<boolean>;
}

export function ImportFromLiveForm({ onImportedActivities }: ImportFromLiveFormProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success?: boolean;
    activitiesCount?: number;
    playersCount?: number;
    error?: string;
  } | null>(null);
  const [customUrl, setCustomUrl] = useState('https://hassleholmsifp2014.lovable.app');
  const [urlError, setUrlError] = useState<string | null>(null);

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) {
      setUrlError("URL får inte vara tom");
      return false;
    }
    
    try {
      new URL(url);
      
      // Check that URL has correct format (protocol + domain)
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        setUrlError("URL måste börja med http:// eller https://");
        return false;
      }
      
      // Remove any trailing slashes and paths - we only want the base URL
      if (url.includes('/api/') || url.includes('/export/')) {
        setUrlError("Ange endast bas-URL:en utan '/api/' eller '/export/' sökvägar");
        return false;
      }
      
      setUrlError(null);
      return true;
    } catch (e) {
      setUrlError("Ogiltig URL-format");
      return false;
    }
  };

  const handleImport = async () => {
    if (!validateUrl(customUrl)) {
      return;
    }

    try {
      setIsImporting(true);
      setImportResults(null);
      
      // Normalize the URL - remove trailing slashes
      const liveUrl = customUrl.trim().replace(/\/+$/, '');
      console.log("Importing from live URL:", liveUrl);
      
      const results = await importFromLiveEnv(liveUrl);
      console.log("Import results:", results);
      
      setImportResults(results);
      
      if (results.success) {
        toast.success(`Data importerad: ${results.activitiesCount} aktiviteter och ${results.playersCount} spelare`);
        
        // Call the callback if provided
        if (onImportedActivities && results.activities) {
          console.log("Passing activities to parent component:", results.activities.length);
          // Pass the activities back to the parent component
          await onImportedActivities(results.activities);
        }
      } else {
        toast.error(`Import misslyckades: ${results.error}`);
      }
    } catch (error) {
      console.error("Error during import:", error);
      toast.error(`Ett fel inträffade: ${error instanceof Error ? error.message : 'Okänt fel'}`);
      setImportResults({
        success: false,
        error: error instanceof Error ? error.message : 'Okänt fel'
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="space-y-4 p-0">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <Input 
              placeholder="https://hassleholmsifp2014.lovable.app" 
              value={customUrl}
              onChange={(e) => {
                setCustomUrl(e.target.value);
                if (e.target.value) {
                  validateUrl(e.target.value);
                } else {
                  setUrlError(null);
                }
              }}
              className={`flex-1 ${urlError ? 'border-red-500' : ''}`}
              disabled={isImporting}
            />
            <Button 
              onClick={() => window.open(customUrl, '_blank')}
              size="icon" 
              variant="outline"
              disabled={!customUrl || !!urlError}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
          
          {urlError && (
            <div className="text-red-500 text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {urlError}
            </div>
          )}
          
          <Alert className="bg-blue-50 text-blue-800 border-blue-200">
            <Info className="h-4 w-4" />
            <AlertTitle>Tips</AlertTitle>
            <AlertDescription className="text-sm">
              <p>
                Ange adressen till live-miljön (t.ex. "https://hassleholmsifp2014.lovable.app"). 
                Systemet kommer automatiskt lägga till "/api/export/activities" och "/api/export/players" för att hämta data.
              </p>
              
              <div className="mt-3">
                <strong>Om importen misslyckas med HTML-fel:</strong>
                <ol className="list-decimal pl-5 mt-1 space-y-1">
                  <li>Det är troligt att live-miljön inte stödjer det API-format som används här</li>
                  <li>Alternativa sätt att återställa data:</li>
                </ol>
              </div>
              
              <div className="mt-2 space-y-2 bg-blue-100 p-3 rounded-md">
                <strong className="text-blue-900">Alternativ 1: Använd säkerhetskopiering i live-miljön</strong>
                <div className="pl-3">
                  <p>1. Gå till live-miljön och använd "Verktyg" → "Säkerhetskopiering"</p>
                  <p>2. Skapa en säkerhetskopia och ladda ner filen</p>
                  <p>3. I dev-miljön använd "Återställ från säkerhetskopia" med den nedladdade filen</p>
                </div>
              </div>
              
              <div className="mt-2 space-y-2 bg-blue-100 p-3 rounded-md">
                <strong className="text-blue-900">Alternativ 2: Exportera direkt från Supabase</strong>
                <div className="pl-3">
                  <p>1. Logga in på Supabase-dashboarden för live-miljön</p>
                  <p>2. Exportera tabellerna "activities", "players", och "player_activities"</p>
                  <p>3. Importera dessa tabeller i Supabase för dev-miljön</p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
        
        {importResults && (
          <Alert variant={importResults.success ? "default" : "destructive"}>
            <AlertDescription>
              {importResults.success 
                ? `Importerat ${importResults.activitiesCount} aktiviteter och ${importResults.playersCount} spelare`
                : `Import misslyckades: ${importResults.error}`
              }
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col gap-2">
          <Button 
            onClick={handleImport} 
            disabled={isImporting || !customUrl || !!urlError}
            className="w-full"
          >
            {isImporting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" /> Importerar...
              </>
            ) : (
              <>
                <ArrowDownToLine className="mr-2 h-4 w-4" /> Importera från Live-miljö
              </>
            )}
          </Button>
          
          <div className="text-xs text-muted-foreground text-center italic">
            eller använd säkerhetskopieringsfunktionen nedan
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
