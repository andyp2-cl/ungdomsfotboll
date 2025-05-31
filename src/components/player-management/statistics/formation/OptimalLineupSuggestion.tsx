
import React, { useState, useEffect } from "react";
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { suggestOptimalLineup, getOpponents, LineupSuggestion } from "@/utils/playerCombinations";
import { Users, TrendingUp, Target, Star, Trophy, AlertCircle, RefreshCw } from "lucide-react";

interface OptimalLineupSuggestionProps {
  players: Player[];
  activities: Activity[];
}

const formations = [
  { value: "2-3-1", label: "2-3-1 (Klassisk)" },
  { value: "3-2-1", label: "3-2-1 (Defensiv)" },
  { value: "2-2-2", label: "2-2-2 (Balanserad)" },
  { value: "3-3", label: "3-3 (Ultra defensiv)" },
  { value: "2-4", label: "2-4 (Offensiv)" },
  { value: "1-3-2", label: "1-3-2 (Ultra offensiv)" },
];

export function OptimalLineupSuggestion({ players, activities }: OptimalLineupSuggestionProps) {
  const [selectedFormation, setSelectedFormation] = useState("2-3-1");
  const [selectedOpponent, setSelectedOpponent] = useState<string>("");
  const [suggestion, setSuggestion] = useState<LineupSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const opponents = getOpponents(activities);

  const generateSuggestion = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("OptimalLineupSuggestion: Generating suggestion...");
      const result = await suggestOptimalLineup(
        players,
        activities,
        selectedFormation,
        selectedOpponent || undefined
      );
      console.log("OptimalLineupSuggestion: Generated suggestion:", result);
      setSuggestion(result);
    } catch (err) {
      console.error("OptimalLineupSuggestion: Error generating suggestion:", err);
      setError("Ett fel uppstod vid generering av laguppställning. Försök igen.");
      setSuggestion(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-generate suggestion when inputs change
  useEffect(() => {
    if (players.length > 0 && activities.length > 0) {
      generateSuggestion();
    }
  }, [selectedFormation, selectedOpponent, players, activities]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-green-500";
    if (confidence >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 70) return "text-green-600";
    if (winRate >= 50) return "text-blue-600";
    return "text-yellow-600";
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 1.5) return "text-green-600";
    if (efficiency >= 1.2) return "text-blue-600";
    return "text-yellow-600";
  };

  if (players.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Inga spelare tillgängliga</h3>
          <p className="text-muted-foreground">
            Lägg till spelare för att få förslag på optimal laguppställning.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Optimal Laguppställning
          </CardTitle>
          <CardDescription>
            AI-genererad laguppställning baserad på spelarstatistik och kombinationsanalys
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="formation">Formation</Label>
            <Select value={selectedFormation} onValueChange={setSelectedFormation}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formations.map((formation) => (
                  <SelectItem key={formation.value} value={formation.value}>
                    {formation.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="opponent">Motståndare (valfritt)</Label>
            <Select value={selectedOpponent} onValueChange={setSelectedOpponent}>
              <SelectTrigger>
                <SelectValue placeholder="Välj motståndare för smart nivåjustering..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Ingen specifik motståndare</SelectItem>
                {opponents.map((opponent) => (
                  <SelectItem key={opponent} value={opponent}>
                    {opponent}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button 
              onClick={generateSuggestion} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Genererar...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Uppdatera förslag
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Analyserar spelarkombinationer och genererar optimal uppställning...</p>
          </CardContent>
        </Card>
      )}

      {/* Suggestion Display */}
      {suggestion && !isLoading && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className={`h-5 w-5 ${getWinRateColor(suggestion.expectedWinRate)}`} />
                  <div>
                    <p className="text-sm text-muted-foreground">Förväntad vinstchans</p>
                    <p className={`text-2xl font-bold ${getWinRateColor(suggestion.expectedWinRate)}`}>
                      {Math.round(suggestion.expectedWinRate)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className={`h-5 w-5 ${getEfficiencyColor(suggestion.totalEfficiency)}`} />
                  <div>
                    <p className="text-sm text-muted-foreground">Lagets effektivitet</p>
                    <p className={`text-2xl font-bold ${getEfficiencyColor(suggestion.totalEfficiency)}`}>
                      {suggestion.totalEfficiency.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tillförlitlighet</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">{Math.round(suggestion.confidence)}%</p>
                      <Badge className={`${getConfidenceColor(suggestion.confidence)} text-white text-xs`}>
                        {suggestion.confidence >= 80 ? 'Hög' : suggestion.confidence >= 60 ? 'Medium' : 'Låg'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lineup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Föreslagen Uppställning ({suggestion.formation})
              </CardTitle>
              {suggestion.gradeStrategy && (
                <CardDescription className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                  <strong>Smart nivåjustering:</strong> {suggestion.gradeStrategy}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {suggestion.players.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Kunde inte generera en komplett uppställning</p>
                  <p className="text-sm">Kontrollera att det finns tillräckligt med aktiva spelare</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {suggestion.players.map((player, index) => (
                    <div
                      key={player.playerId}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="min-w-[60px] justify-center">
                            {player.position}
                          </Badge>
                          {index === 0 && <Star className="h-4 w-4 text-yellow-500" />}
                        </div>
                        <div>
                          <p className="font-semibold">{player.playerName}</p>
                          <p className="text-sm text-muted-foreground">{player.reasoning}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis & Reasoning */}
          <Card>
            <CardHeader>
              <CardTitle>Analys & Resonemang</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {suggestion.reasoning.map((reason, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm">{reason}</p>
                  </div>
                ))}
              </div>

              {suggestion.recommendedAverageGrade && (
                <div className="mt-4 p-3 bg-green-50 rounded border-l-4 border-green-400">
                  <p className="text-sm">
                    <strong>Rekommenderad genomsnittsnivå:</strong> {suggestion.recommendedAverageGrade.toFixed(1)} 
                    ({suggestion.recommendedAverageGrade >= 3.5 ? 'A' : 
                      suggestion.recommendedAverageGrade >= 2.5 ? 'B' : 
                      suggestion.recommendedAverageGrade >= 1.5 ? 'C' : 'D'})
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
