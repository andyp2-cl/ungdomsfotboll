
import React, { useState } from "react";
import { Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload } from "lucide-react";

interface ImportActivitiesFormProps {
  onImportedActivities: (activities: Activity[]) => Promise<boolean>;
}

export function ImportActivitiesForm({ onImportedActivities }: ImportActivitiesFormProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importedActivities, setImportedActivities] = useState<Activity[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setErrorMessage(null);

    try {
      const fileReader = new FileReader();
      
      fileReader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const parsedActivities = JSON.parse(content);
          
          if (!Array.isArray(parsedActivities)) {
            throw new Error("Filen innehåller inte en aktivitetsarray");
          }
          
          setImportedActivities(parsedActivities);
          toast.success(`${parsedActivities.length} aktiviteter lästes från filen`);
        } catch (parseError) {
          console.error("Error parsing file:", parseError);
          setErrorMessage(`Kunde inte tolka filen: ${parseError instanceof Error ? parseError.message : 'Ogiltigt JSON-format'}`);
          toast.error("Kunde inte tolka filen");
        } finally {
          setIsImporting(false);
        }
      };
      
      fileReader.onerror = () => {
        setErrorMessage("Kunde inte läsa filen");
        setIsImporting(false);
        toast.error("Kunde inte läsa filen");
      };
      
      fileReader.readAsText(file);
    } catch (error) {
      console.error("Error processing file:", error);
      setErrorMessage(`Ett fel uppstod: ${error instanceof Error ? error.message : 'Okänt fel'}`);
      setIsImporting(false);
      toast.error("Ett fel uppstod vid filhantering");
    }
  };

  const handleImport = async () => {
    if (!importedActivities) return;
    
    setIsImporting(true);
    try {
      const success = await onImportedActivities(importedActivities);
      
      if (success) {
        toast.success(`${importedActivities.length} aktiviteter importerades`);
        setImportedActivities(null);
        // Reset file input
        const fileInput = document.getElementById('activity-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        toast.error("Kunde inte importera aktiviteter");
      }
    } catch (error) {
      console.error("Error importing activities:", error);
      toast.error(`Ett fel uppstod: ${error instanceof Error ? error.message : 'Okänt fel'}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Importera aktiviteter</CardTitle>
        <CardDescription>
          Ladda upp en JSON-fil med aktiviteter för att importera dem
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <input
            id="activity-file-input"
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileChange}
            disabled={isImporting}
          />
          <Button 
            variant="outline" 
            onClick={() => document.getElementById('activity-file-input')?.click()}
            disabled={isImporting}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" /> Välj JSON-fil
          </Button>
        </div>
        
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        {importedActivities && (
          <Alert>
            <AlertDescription>
              {`${importedActivities.length} aktiviteter redo att importera`}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleImport} 
          disabled={!importedActivities || isImporting}
          className="w-full"
        >
          {isImporting ? (
            <>
              <Spinner className="mr-2 h-4 w-4" /> Importerar...
            </>
          ) : (
            "Importera aktiviteter"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
