import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { saveTrainingUpload } from "@/lib/supabase/trainingUploads";
import Papa from "papaparse";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TrainingStats {
  playerId: string;
  playerName: string;
  trainingSessions: number;
  matchesPlayed: number;
  trainingMatchRatio: number;
}

interface TrainingStatsUploadProps {
  onStatsUploaded: (stats: TrainingStats[]) => void;
}

export function TrainingStatsUpload({
  onStatsUploaded
}: TrainingStatsUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpload, setLastUpload] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      if (!file.name.endsWith('.csv')) {
        toast({
          title: "Fel filformat",
          description: "Endast CSV-filer stöds.",
          variant: "destructive"
        });
        return;
      }

      const text = await file.text();
      const lines = text.split(/\r?\n/);
      let headerIndex = lines.findIndex(line => 
        line.includes('Namn') && line.includes('Aktiviteter kallad till')
      );
      
      if (headerIndex === -1) {
        toast({
          title: "Felaktigt format",
          description: "Kunde inte hitta kolumnnamn i CSV-filen.",
          variant: "destructive"
        });
        return;
      }

      const csvContent = lines.slice(headerIndex).join('\n');
      const result = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true
      });

      if (result.errors.length > 0) {
        toast({
          title: "Fel vid tolkning",
          description: "Kunde inte läsa CSV-filen korrekt.",
          variant: "destructive"
        });
        return;
      }

      const stats: TrainingStats[] = (result.data as any[])
        .filter(row => row["Namn"] && row["Aktiviteter kallad till"])
        .map(row => ({
          playerId: row["Namn"],
          playerName: row["Namn"],
          trainingSessions: Number(row["Aktiviteter kallad till"] || 0),
          matchesPlayed: Number(row["Aktiviteter deltagit i"] || 0),
          trainingMatchRatio: Number(row["Aktiviteter kallad till"] || 0) > 0 
            ? Number(row["Aktiviteter deltagit i"] || 0) / Number(row["Aktiviteter kallad till"] || 0) 
            : 0
        }));

      if (stats.length === 0) {
        toast({
          title: "Ingen data",
          description: "Ingen giltig närvarodata hittades i filen.",
          variant: "destructive"
        });
        return;
      }

      await saveTrainingUpload(file.name, stats);
      onStatsUploaded(stats);
      setLastUpload(new Date().toLocaleString('sv-SE'));
      
      toast({
        title: "Träningsstatistik uppladdad",
        description: `${stats.length} spelares statistik har sparats.`
      });

    } catch (err) {
      console.error('Upload error:', err);
      toast({
        title: "Uppladdning misslyckades",
        description: "Kunde inte spara träningsstatistiken.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      // Reset input
      event.target.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="relative"
                disabled={isLoading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Ladda upp statistik
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  tabIndex={-1}
                />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Ladda upp CSV med:</p>
            <ul className="list-disc list-inside text-xs">
              <li>Namn</li>
              <li>Aktiviteter kallad till</li>
              <li>Aktiviteter deltagit i</li>
              <li>Andel</li>
            </ul>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {lastUpload && (
        <span className="text-xs text-muted-foreground">
          Senast uppdaterad: {lastUpload}
        </span>
      )}
    </div>
  );
}
