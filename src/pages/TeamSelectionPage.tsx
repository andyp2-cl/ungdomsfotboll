import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Player } from "@/types/player";
import { Match } from "@/types/match";

interface TrainingStats {
  playerId: string;
  trainingSessions: number;
  matchesPlayed: number;
  trainingMatchRatio: number;
}

export default function TeamSelectionPage() {
  const [trainingStats, setTrainingStats] = useState<TrainingStats[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // TODO: Implementera Excel-filhantering
    }
  };

  const getLeaguePriority = (league: string): number => {
    switch (league) {
      case "2013 A":
        return 1; // A
      case "2014 A1":
        return 1; // A
      case "2014 A2":
        return 2; // B
      case "2014 B1":
        return 3; // C,D
      default:
        return 4;
    }
  };

  const calculatePlayerScore = (player: Player, stats: TrainingStats) => {
    // Grundpoäng baserat på träning/match ratio
    const baseScore = stats.trainingMatchRatio;
    
    // Justera baserat på ligaprioritet
    const leaguePriority = getLeaguePriority(player.league);
    const leagueMultiplier = 1 / leaguePriority;
    
    return baseScore * leagueMultiplier;
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Laguttagning</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ladda upp träningsstatistik</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="mb-4"
            />
            <p className="text-sm text-muted-foreground">
              Ladda upp Excel-fil med träningsstatistik för att beräkna optimal laguttagning
            </p>
          </CardContent>
        </Card>

        {warnings.length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              <ul>
                {warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Kommande matcher</CardTitle>
          </CardHeader>
          <CardContent>
            {/* TODO: Implementera visning av kommande matcher och laguttagning */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 