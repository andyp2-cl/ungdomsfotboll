import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, AlertCircle } from "lucide-react";
import Papa from "papaparse";
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setError(null);
    setIsLoading(true);
    try {
      if (!file.name.endsWith('.csv')) {
        setError("Endast CSV-filer stöds.");
        setIsLoading(false);
        return;
      }
      const text = await file.text();
      // Hitta raden med kolumnnamn
      const lines = text.split(/\r?\n/);
      let headerIndex = lines.findIndex(line => line.includes('Namn') && line.includes('Aktiviteter kallad till'));
      if (headerIndex === -1) {
        setError("Kunde inte hitta kolumnnamn i CSV-filen.");
        setIsLoading(false);
        return;
      }
      const csvContent = lines.slice(headerIndex).join('\n');
      const result = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true
      });
      if (result.errors.length > 0) {
        setError("Fel vid tolkning av CSV: " + result.errors[0].message);
        setIsLoading(false);
        return;
      }
      // Filtrera bort rader utan namn
      const stats: TrainingStats[] = (result.data as any[]).filter(row => row["Namn"] && row["Aktiviteter kallad till"]).map(row => ({
        playerId: row["Namn"],
        playerName: row["Namn"],
        trainingSessions: Number(row["Aktiviteter kallad till"] || 0),
        matchesPlayed: Number(row["Aktiviteter deltagit i"] || 0),
        trainingMatchRatio: Number(row["Aktiviteter kallad till"] || 0) > 0 ? Number(row["Aktiviteter kallad till"] || 0) / Number(row["Aktiviteter deltagit i"] || 1) : 0
      }));
      if (stats.length === 0) {
        setError("Ingen giltig närvarodata hittades i filen.");
        setIsLoading(false);
        return;
      }
      onStatsUploaded(stats);
    } catch (err) {
      setError("Kunde inte läsa in filen. Kontrollera att det är en giltig CSV-fil.");
    } finally {
      setIsLoading(false);
    }
  };
  return <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Upload className="h-5 w-5" />
          Ladda upp träningsstatistik
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input type="file" accept=".csv" onChange={handleFileUpload} disabled={isLoading} className="cursor-pointer" />
          
          {error && <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>}

          <p className="text-muted-foreground text-xs">
            Ladda upp en CSV-fil med träningsstatistik. Filen ska innehålla:
            <ul className="list-disc list-inside mt-2">
              <li>Namn</li>
              <li>Aktiviteter kallad till</li>
              <li>Aktiviteter deltagit i</li>
              <li>Andel</li>
            </ul>
          </p>
        </div>
      </CardContent>
    </Card>;
}