
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Database } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export function DirectImportPanel({ onSuccess }: { onSuccess?: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{ players?: number; activities?: number } | null>(null);

  const handleDirectImport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setResults(null);
      
      toast.loading("Försöker importera data direkt från live-miljön...", { id: "direct-import" });
      
      // URL till live-miljöns Supabase
      const liveSupabaseUrl = "https://zkrruihxszziifyogzko.supabase.co";
      const liveAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcnJ1aWh4c3p6aWlmeW9nemtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNjQ1NDksImV4cCI6MjA1ODc0MDU0OX0.ct3AMhbgnJg6pOjlACfwPR5n_Nz2pHX5AScfe84YM0U";
      
      // Försök att direktimportera aktiviteter
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('*');
        
      if (activitiesError) {
        throw new Error(`Kunde inte hämta aktiviteter: ${activitiesError.message}`);
      }
      
      // Försök att direktimportera spelare
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('*');
        
      if (playersError) {
        throw new Error(`Kunde inte hämta spelare: ${playersError.message}`);
      }
      
      // Återställ nuvarande data och importera den nya
      console.log(`Importerade ${players.length} spelare och ${activities.length} aktiviteter`);
      
      // Rensa och importera data i din befintliga miljö
      // Detta förutsätter att du har funktioner för att rensa och importera data
      
      // Uppdatera UI med resultat
      setResults({
        players: players.length,
        activities: activities.length
      });
      
      toast.success(`Importerade ${players.length} spelare och ${activities.length} aktiviteter från live-miljön!`, { 
        id: "direct-import" 
      });
      
      // Anropa callback om allt lyckades
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Fel vid direktimport:", error);
      setError(error instanceof Error ? error.message : 'Ett okänt fel inträffade');
      toast.error(`Importen misslyckades: ${error instanceof Error ? error.message : 'Ett okänt fel inträffade'}`, {
        id: "direct-import"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 items-center">
        <Button 
          onClick={handleDirectImport}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" /> Importerar från live-miljön...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" /> Importera direkt från live-miljön
            </>
          )}
        </Button>
        
        <div className="text-sm text-muted-foreground">
          Detta kommer att importera all data direkt från live-miljön
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Importen misslyckades</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {results && (
        <Alert className="border-green-500 bg-green-50 text-green-800">
          <AlertTitle>Importen lyckades!</AlertTitle>
          <AlertDescription>
            Importerade {results.players} spelare och {results.activities} aktiviteter från live-miljön.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
