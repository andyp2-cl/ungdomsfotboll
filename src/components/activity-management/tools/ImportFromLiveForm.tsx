
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { ArrowDownToLine, ExternalLink } from "lucide-react";
import { importFromLiveEnv } from "@/utils/storage/backup/restore-activities";
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
  const [customUrl, setCustomUrl] = useState('');

  const handleImport = async () => {
    try {
      setIsImporting(true);
      setImportResults(null);
      
      const liveUrl = customUrl.trim() || 'https://hassleholmsifp2014.lovable.app';
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
        <div className="flex items-center space-x-2">
          <Input 
            placeholder="https://hassleholmsifp2014.lovable.app" 
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="flex-1"
            disabled={isImporting}
          />
          <Button 
            onClick={() => window.open('https://hassleholmsifp2014.lovable.app', '_blank')}
            size="icon" 
            variant="outline"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
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
        
        <Button 
          onClick={handleImport} 
          disabled={isImporting}
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
      </CardContent>
    </Card>
  );
}
