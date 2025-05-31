import React, { useState, useEffect } from "react";
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { suggestBalancedLineup, getOpponents, BalancedLineupSuggestion } from "@/utils/playerCombinations";
import { Users, Target, TrendingUp, Scale, AlertCircle, RefreshCw, Users2 } from "lucide-react";

interface BalancedMatchOptimizerProps {
  players: Player[];
  activities: Activity[];
  onPlayerSelect?: (playerId: string) => void;
}

const formations = [
  { value: "2-3-1", label: "2-3-1 (Klassisk)" },
  { value: "3-2-1", label: "3-2-1 (Defensiv)" },
  { value: "2-2-2", label: "2-2-2 (Balanserad)" },
  { value: "3-3", label: "3-3 (Ultra defensiv)" },
  { value: "2-4", label: "2-4 (Offensiv)" },
  { value: "1-3-2", label: "1-3-2 (Ultra offensiv)" },
];

export function BalancedMatchOptimizer({ players, activities, onPlayerSelect }: BalancedMatchOptimizerProps) {
  const [selectedFormation, setSelectedFormation] = useState("2-3-1");
  const [selectedOpponent, setSelectedOpponent] = useState<string>("");
  const [targetGoalDifference, setTargetGoalDifference] = useState([2]);
  const [prioritizeNewPlayers, setPrioritizeNewPlayers] = useState(true);
  const [rotationStrength, setRotationStrength] = useState([70]);
  const [suggestion, setSuggestion] = useState<BalancedLineupSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const opponents = getOpponents(activities);

  const generateSuggestion = async () => {
    if (!selectedOpponent) {
      setError("Välj en motståndare för att generera balanserad uppställning");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log("BalancedMatchOptimizer: Generating suggestion...");
      const result = await suggestBalancedLineup(
        players,
        activities,
        selectedOpponent,
        selectedFormation,
        targetGoalDifference[0],
        prioritizeNewPlayers,
        rotationStrength[0]
      );
      console.log("BalancedMatchOptimizer: Generated suggestion:", result);
      setSuggestion(result);
    } catch (err) {
      console.error("BalancedMatchOptimizer: Error generating suggestion:", err);
      setError("Ett fel uppstod vid generering av balanserad uppställning. Försök igen.");
      setSuggestion(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-generate suggestion when key inputs change
  useEffect(() => {
    if (players.length > 0 && activities.length > 0 && selectedOpponent) {
      generateSuggestion();
    }
  }, [selectedFormation, selectedOpponent, targetGoalDifference[0], prioritizeNewPlayers, rotationStrength[0], players, activities]);

  const getBalanceColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-blue-600";
    return "text-yellow-600";
  };

  if (players.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Inga spelare tillgängliga</h3>
          <p className="text-muted-foreground">
            Lägg till spelare för att få förslag på balanserad laguppställning.
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
            <Scale className="h-5 w-5" />
            Balanserad Matchoptimering
          </CardTitle>
          <CardDescription>
            Optimera laguppställning för jämna, roliga matcher med smart rotation och nivåjustering
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="opponent">Motståndare</Label>
              <Select value={selectedOpponent} onValueChange={setSelectedOpponent}>
                <SelectTrigger>
                  <SelectValue placeholder="Välj motståndare..." />
                </SelectTrigger>
                <SelectContent>
                  {opponents.map((opponent) => (
                    <SelectItem key={opponent} value={opponent}>
                      {opponent}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Målsättning: {targetGoalDifference[0]} mål framåt</Label>
              <Slider
                value={targetGoalDifference}
                onValueChange={setTargetGoalDifference}
                max={5}
                min={1}
                step={1}
                className="mt-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>1 (Jämn match)</span>
                <span>5 (Säker vinst)</span>
              </div>
            </div>

            <div>
              <Label>Rotationsstyrka: {rotationStrength[0]}%</Label>
              <Slider
                value={rotationStrength}
                onValueChange={setRotationStrength}
                max={100}
                min={0}
                step={10}
                className="mt-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>0% (Prestanda fokus)</span>
                <span>100% (Vila fokus)</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="prioritize-new"
                checked={prioritizeNewPlayers}
                onCheckedChange={setPrioritizeNewPlayers}
              />
              <Label htmlFor="prioritize-new">
                Prioritera spelare som inte mött denna motståndare tidigare
              </Label>
            </div>
          </div>

          <Button 
            onClick={generateSuggestion} 
            disabled={isLoading || !selectedOpponent}
            className="w-full"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Optimerar...
              </>
            ) : (
              <>
                <Scale className="h-4 w-4 mr-2" />
                Generera balanserad uppställning
              </>
            )}
          </Button>
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
            <p className="text-muted-foreground">Optimerar laguppställning för balanserad match...</p>
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
                  <Target className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Förväntad målskillnad</p>
                    <p className="text-2xl font-bold text-green-600">
                      +{suggestion.expectedGoalDifference.toFixed(1)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Balanspoäng</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">{Math.round(suggestion.balanceScore)}</p>
                      <Badge className={`${getBalanceColor(suggestion.balanceScore)} text-white text-xs`}>
                        {suggestion.balanceScore >= 80 ? 'Utmärkt' : suggestion.balanceScore >= 60 ? 'Bra' : 'OK'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tillförlitlighet</p>
                    <p className={`text-2xl font-bold ${getConfidenceColor(suggestion.confidence)}`}>
                      {Math.round(suggestion.confidence)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Starting Lineup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Startuppställning ({suggestion.formation})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {suggestion.players.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Kunde inte generera en komplett startuppställning</p>
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
                        <Badge variant="outline" className="min-w-[60px] justify-center">
                          {player.position}
                        </Badge>
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

          {/* Bench Players */}
          {suggestion.benchPlayers && suggestion.benchPlayers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users2 className="h-5 w-5" />
                  Bänkspelare
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {suggestion.benchPlayers.map((player) => (
                    <div
                      key={player.playerId}
                      className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="min-w-[60px] justify-center">
                          {player.position}
                        </Badge>
                        <div>
                          <p className="font-semibold">{player.playerName}</p>
                          <p className="text-sm text-muted-foreground">{player.reasoning}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analysis & Reasoning */}
          <Card>
            <CardHeader>
              <CardTitle>Optimeringsanalys</CardTitle>
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
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
