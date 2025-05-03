
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Database, Info, AlertCircle } from "lucide-react";
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
      
      toast.loading("Importerar data direkt från Supabase...", { id: "direct-import" });
      
      // Direktåtkomst till Supabase via produktionsprojektet (live-miljön)
      // Detta använder samma anon-nyckel som live-miljön använder
      const liveSupabaseUrl = "https://zkrruihxszziifyogzko.supabase.co";
      const liveAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcnJ1aWh4c3p6aWlmeW9nemtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNjQ1NDksImV4cCI6MjA1ODc0MDU0OX0.ct3AMhbgnJg6pOjlACfwPR5n_Nz2pHX5AScfe84YM0U";
      
      // Skapa en tillfällig Supabase-klient för produktionsmiljön
      const { createClient } = await import('@supabase/supabase-js');
      const liveSupabase = createClient(liveSupabaseUrl, liveAnonKey);
      
      console.log("Försöker hämta data från live Supabase...");
      
      // Hämta aktiviteter från live-miljön
      const { data: activities, error: activitiesError } = await liveSupabase
        .from('activities')
        .select('*');
      
      if (activitiesError) {
        throw new Error(`Kunde inte hämta aktiviteter: ${activitiesError.message}`);
      }
      
      // Hämta spelare från live-miljön
      const { data: players, error: playersError } = await liveSupabase
        .from('players')
        .select('*');
      
      if (playersError) {
        throw new Error(`Kunde inte hämta spelare: ${playersError.message}`);
      }
      
      // Hämta alla player_activities-relationer
      const { data: playerActivities, error: paError } = await liveSupabase
        .from('player_activities')
        .select('*');
      
      if (paError) {
        throw new Error(`Kunde inte hämta player_activities: ${paError.message}`);
      }
      
      console.log(`Hämtade ${activities.length} aktiviteter, ${players.length} spelare och ${playerActivities.length} relationer från live-miljön`);
      
      // IMPORTERA DATA TILL UTVECKLINGSMILJÖN
      // 1. Först rensa befintlig data
      toast.loading("Rensar befintlig data...", { id: "direct-import" });
      
      // Ta bort alla player_activities-relationer först (för att undvika FK-begränsningar)
      const { error: delPaError } = await supabase
        .from('player_activities')
        .delete()
        .neq('player_id', 'dummy-to-delete-all');
      
      if (delPaError) {
        console.error("Fel vid rensning av player_activities:", delPaError);
      }
      
      // 2. Importera data
      toast.loading("Importerar data...", { id: "direct-import" });
      
      // Importera spelare
      let playersImported = 0;
      if (players && players.length > 0) {
        const { error: insertPlayersError } = await supabase
          .from('players')
          .upsert(players, { onConflict: 'id' });
        
        if (insertPlayersError) {
          console.error("Fel vid import av spelare:", insertPlayersError);
          throw new Error(`Kunde inte importera spelare: ${insertPlayersError.message}`);
        }
        playersImported = players.length;
      }
      
      // Importera aktiviteter
      let activitiesImported = 0;
      if (activities && activities.length > 0) {
        const { error: insertActivitiesError } = await supabase
          .from('activities')
          .upsert(activities, { onConflict: 'id' });
        
        if (insertActivitiesError) {
          console.error("Fel vid import av aktiviteter:", insertActivitiesError);
          throw new Error(`Kunde inte importera aktiviteter: ${insertActivitiesError.message}`);
        }
        activitiesImported = activities.length;
      }
      
      // Importera player_activities-relationer
      if (playerActivities && playerActivities.length > 0) {
        const { error: insertPaError } = await supabase
          .from('player_activities')
          .upsert(playerActivities, { onConflict: 'id' });
        
        if (insertPaError) {
          console.error("Fel vid import av player_activities:", insertPaError);
          throw new Error(`Kunde inte importera player_activities: ${insertPaError.message}`);
        }
      }
      
      setResults({
        players: playersImported,
        activities: activitiesImported
      });
      
      toast.success(`Importerade ${activitiesImported} aktiviteter och ${playersImported} spelare från live-miljön!`, { 
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
              <Spinner className="mr-2 h-4 w-4" /> Importerar från Supabase...
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
      
      <Alert className="bg-blue-50 text-blue-800 border-blue-200">
        <Info className="h-4 w-4" />
        <AlertTitle>Om direktimport</AlertTitle>
        <AlertDescription className="text-sm">
          <p>
            Denna funktion använder Supabase direkt för att hämta data från live-miljön 
            utan att gå via ett API.
          </p>
          <p className="mt-2">
            Vid problem: Säkerställ att du är inloggad i båda miljöerna.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
