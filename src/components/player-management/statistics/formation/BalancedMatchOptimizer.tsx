import React, { useState } from "react";
import { Player, Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Target, TrendingUp, AlertTriangle, Info, BarChart3, Users, UserPlus, RotateCcw, Brain } from "lucide-react";
import { FormationSelector } from "./FormationSelector";
import { getOpponents, analyzeOpponentHistory, suggestBalancedLineup, BalancedLineupSuggestion, analyzeOpponentGradeHistory } from "@/utils/playerCombinations";
import { getPositionColor, getPositionLabel } from "./positionUtils";

interface BalancedMatchOptimizerProps {
  players: Player[];
  activities: Activity[];
  onPlayerSelect?: (playerId: string) => void;
}

export function BalancedMatchOptimizer({ 
  players, 
  activities, 
  onPlayerSelect 
}: BalancedMatchOptimizerProps) {
  const [selectedOpponent, setSelectedOpponent] = useState<string>("");
  const [selectedFormation, setSelectedFormation] = useState("2-3-1");
  const [targetGoalDifference, setTargetGoalDifference] = useState([2]);
  const [prioritizeNewPlayers, setPrioritizeNewPlayers] = useState(true);
  const [rotationStrength, setRotationStrength] = useState([70]); // New state for rotation strength
  const [suggestion, setSuggestion] = useState<BalancedLineupSuggestion | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const opponents = getOpponents(activities);

  const handleGenerateSuggestion = async () => {
    if (!selectedOpponent) return;
    
    setIsGenerating(true);
    
    setTimeout(() => {
      const newSuggestion = suggestBalancedLineup(
        players, 
        activities, 
        selectedOpponent, 
        selectedFormation, 
        targetGoalDifference[0],
        prioritizeNewPlayers,
        rotationStrength[0]
      );
      setSuggestion(newSuggestion);
      setIsGenerating(false);
    }, 500);
  };

  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return "text-green-600 bg-green-100";
      case 'medium': return "text-yellow-600 bg-yellow-100";
      case 'high': return "text-red-600 bg-red-100";
    }
  };

  const getBalanceColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-blue-600 bg-blue-100";
    if (score >= 40) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const opponentAnalysis = selectedOpponent ? analyzeOpponentHistory(activities, selectedOpponent) : null;
  const gradeAnalysis = selectedOpponent ? analyzeOpponentGradeHistory(activities, selectedOpponent, players) : null;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold">Balanserad Match Optimizer</h3>
        </div>
        
        <div className="p-4 border rounded-lg bg-purple-50">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-purple-500" />
            <span className="font-medium text-purple-800">Hur det fungerar</span>
          </div>
          <p className="text-sm text-purple-700">
            Välj motståndare och få förslag på en lineup som skapar jämna, spännande matcher. 
            Algoritmen undviker stora vinster/förluster och siktar på en balanserad seger.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Motståndare</label>
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
          
          <div>
            <label className="block text-sm font-medium mb-2">Formation</label>
            <FormationSelector 
              selectedFormation={selectedFormation}
              onFormationChange={setSelectedFormation}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Målskillnad: {targetGoalDifference[0]} mål
            </label>
            <Slider
              value={targetGoalDifference}
              onValueChange={setTargetGoalDifference}
              max={3}
              min={1}
              step={1}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1 (jämnare)</span>
              <span>3 (säkrare)</span>
            </div>
          </div>
        </div>

        {/* New Rotation Strength Parameter */}
        <div className="p-4 border rounded-lg bg-green-50">
          <div className="flex items-center gap-3 mb-3">
            <RotateCcw className="h-5 w-5 text-green-500" />
            <div>
              <Label className="text-sm font-medium text-green-800">
                Rotationsstyrka: {rotationStrength[0]}%
              </Label>
              <p className="text-xs text-green-600 mt-1">
                Hur mycket vila påverkar urval. 100% = vila prioriteras högt, 0% = bara prestanda räknas
              </p>
            </div>
          </div>
          <Slider
            value={rotationStrength}
            onValueChange={setRotationStrength}
            max={100}
            min={0}
            step={10}
            className="mt-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0% (bara prestanda)</span>
            <span>50% (balanserat)</span>
            <span>100% (vila prioriterat)</span>
          </div>
        </div>

        {/* New Parameter for Prioritizing New Players */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
          <div className="flex items-center gap-3">
            <UserPlus className="h-5 w-5 text-blue-500" />
            <div>
              <Label htmlFor="prioritize-new" className="text-sm font-medium text-blue-800">
                Prioritera nya spelare
              </Label>
              <p className="text-xs text-blue-600 mt-1">
                Ge förtur till spelare som inte spelat mot detta lag tidigare
              </p>
            </div>
          </div>
          <Switch
            id="prioritize-new"
            checked={prioritizeNewPlayers}
            onCheckedChange={setPrioritizeNewPlayers}
          />
        </div>

        <Button 
          onClick={handleGenerateSuggestion}
          disabled={!selectedOpponent || isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <BarChart3 className="h-4 w-4 mr-2 animate-pulse" />
              Analyserar motståndare...
            </>
          ) : (
            <>
              <Target className="h-4 w-4 mr-2" />
              Skapa balanserad lineup
            </>
          )}
        </Button>
      </div>

      {/* Enhanced Opponent Analysis with Grade Strategy */}
      {opponentAnalysis && opponentAnalysis.totalMatches > 0 && gradeAnalysis && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Historical Match Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Matchhistorik: {selectedOpponent}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{opponentAnalysis.totalMatches}</div>
                  <div className="text-sm text-muted-foreground">Matcher</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{opponentAnalysis.winRate.toFixed(0)}%</div>
                  <div className="text-sm text-muted-foreground">Vinster</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{opponentAnalysis.averageGoalDifference.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Snitt målskillnad</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{opponentAnalysis.goalDifferenceRange.variance.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Variation</div>
                </div>
              </div>
              
              {opponentAnalysis.recentForm.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">Senaste resultat:</div>
                  <div className="flex gap-1">
                    {opponentAnalysis.recentForm.map((match, index) => (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge 
                              variant={match.result === 'W' ? 'default' : match.result === 'D' ? 'secondary' : 'destructive'}
                              className="text-xs"
                            >
                              {match.result}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{match.date}: Målskillnad {match.goalDifference > 0 ? '+' : ''}{match.goalDifference}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* New Grade Strategy Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                Smart Nivåstrategi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gradeAnalysis.lastMatchResult && (
                  <div className="p-3 border rounded-lg bg-blue-50">
                    <div className="text-sm font-medium mb-2">Senaste matchen:</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Vårt snitt: </span>
                        <span className="font-medium">
                          Nivå {gradeAnalysis.lastMatchResult.ourGrade >= 3.5 ? 'A' :
                                gradeAnalysis.lastMatchResult.ourGrade >= 2.5 ? 'B' :
                                gradeAnalysis.lastMatchResult.ourGrade >= 1.5 ? 'C' : 'D'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Resultat: </span>
                        <span className="font-medium">
                          {gradeAnalysis.lastMatchResult.wasWin ? 'Vinst' : 'Förlust'} 
                          ({gradeAnalysis.lastMatchResult.goalDifference > 0 ? '+' : ''}{gradeAnalysis.lastMatchResult.goalDifference})
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="p-3 border rounded-lg">
                  <div className="text-sm font-medium mb-2">Rekommendation:</div>
                  <div className="flex items-center gap-2 mb-2">
                    {gradeAnalysis.recommendedGradeAdjustment > 0 && (
                      <Badge className="bg-red-100 text-red-700">⬆ Högre nivå</Badge>
                    )}
                    {gradeAnalysis.recommendedGradeAdjustment < 0 && (
                      <Badge className="bg-green-100 text-green-700">⬇ Lägre nivå</Badge>
                    )}
                    {gradeAnalysis.recommendedGradeAdjustment === 0 && (
                      <Badge className="bg-blue-100 text-blue-700">→ Samma nivå</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {gradeAnalysis.reasoning}
                  </p>
                </div>

                <div className="text-sm">
                  <span className="text-muted-foreground">Historiskt snitt: </span>
                  <span className="font-medium">
                    Nivå {gradeAnalysis.averageGrade >= 3.5 ? 'A' :
                          gradeAnalysis.averageGrade >= 2.5 ? 'B' :
                          gradeAnalysis.averageGrade >= 1.5 ? 'C' : 'D'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Suggestion Results */}
      {suggestion && (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Förväntad målskillnad</div>
                    <div className="font-bold">{suggestion.expectedGoalDifference.toFixed(1)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Balanspoäng</div>
                    <div className={`font-bold px-2 py-1 rounded text-xs ${getBalanceColor(suggestion.balanceScore)}`}>
                      {suggestion.balanceScore.toFixed(0)}/100
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Rotationsstyrka</div>
                    <div className="font-bold">{rotationStrength[0]}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Tillförlitlighet</div>
                    <div className="font-bold">{suggestion.confidence.toFixed(0)}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Player Lineup */}
          <Card>
            <CardHeader>
              <CardTitle>Balanserad lineup</CardTitle>
              <CardDescription>
                Optimerad för jämn och spännande match mot {selectedOpponent}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Starting Lineup */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Startuppställning
                  </h4>
                  <div className="space-y-3">
                    {suggestion.players.map((player) => (
                      <div 
                        key={player.playerId}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Badge 
                          style={{ backgroundColor: getPositionColor(player.position as any) }}
                          className="text-white font-medium"
                        >
                          {player.position}
                        </Badge>
                        
                        <div>
                          <div className="font-medium">{player.playerName}</div>
                          <div className="text-sm text-muted-foreground">{player.reasoning}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bench Players */}
                {suggestion.benchPlayers && suggestion.benchPlayers.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Bänkspelare ({suggestion.benchPlayers.length})
                    </h4>
                    <div className="space-y-3">
                      {suggestion.benchPlayers.map((player) => (
                        <div 
                          key={player.playerId}
                          className="flex items-center gap-3 p-3 border rounded-lg bg-blue-50/50 hover:bg-blue-50 transition-colors"
                        >
                          <Badge 
                            style={{ backgroundColor: getPositionColor(player.position as any) }}
                            className="text-white font-medium opacity-80"
                          >
                            {player.position}
                          </Badge>
                          
                          <div>
                            <div className="font-medium">{player.playerName}</div>
                            <div className="text-sm text-muted-foreground">{player.reasoning}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reasoning */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Analys och motivering</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {suggestion.reasoning.map((reason, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!suggestion && !isGenerating && (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium mb-2">Välj motståndare för smart lineup</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Välj ett lag som ni mött tidigare för att få en optimerad lineup med smart nivåjustering baserat på tidigare resultat.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
