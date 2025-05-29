
import React, { useState } from "react";
import { Player, Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Target, TrendingUp, AlertTriangle, Info, BarChart3, Users } from "lucide-react";
import { FormationSelector } from "./FormationSelector";
import { getOpponents, analyzeOpponentHistory, suggestBalancedLineup, BalancedLineupSuggestion } from "@/utils/playerCombinations";
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
  const [targetGoalDifference, setTargetGoalDifference] = useState([1]);
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
        targetGoalDifference[0]
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

      {/* Opponent Analysis */}
      {opponentAnalysis && opponentAnalysis.totalMatches > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Historisk analys: {selectedOpponent}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Risknivå</div>
                    <div className={`font-bold px-2 py-1 rounded text-xs ${getRiskColor(suggestion.riskLevel)}`}>
                      {suggestion.riskLevel === 'low' ? 'Låg' : suggestion.riskLevel === 'medium' ? 'Medel' : 'Hög'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
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
              <div className="space-y-3">
                {suggestion.players.map((player) => (
                  <div 
                    key={player.playerId}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
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
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPlayerSelect?.(player.playerId)}
                    >
                      Visa profil
                    </Button>
                  </div>
                ))}
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
            <h3 className="font-medium mb-2">Välj motståndare för balanserad lineup</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Välj ett lag som ni mött tidigare för att få en optimerad lineup som skapar jämna matcher.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
