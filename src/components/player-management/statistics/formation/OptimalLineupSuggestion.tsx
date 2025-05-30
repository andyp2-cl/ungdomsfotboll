import React, { useState } from "react";
import { Player, Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RefreshCw, Users, TrendingUp, Target, Info, Lightbulb, Brain } from "lucide-react";
import { FormationSelector } from "./FormationSelector";
import { FormationField } from "./FormationField";
import { suggestOptimalLineup, LineupSuggestion, getOpponents, analyzeOpponentGradeHistory } from "@/utils/playerCombinations";
import { getPositionColor, getPositionLabel } from "./positionUtils";

interface OptimalLineupSuggestionProps {
  players: Player[];
  activities: Activity[];
  onPlayerSelect?: (playerId: string) => void;
}

export function OptimalLineupSuggestion({ 
  players, 
  activities, 
  onPlayerSelect 
}: OptimalLineupSuggestionProps) {
  const [selectedFormation, setSelectedFormation] = useState("2-3-1");
  const [selectedOpponent, setSelectedOpponent] = useState<string>("");
  const [suggestion, setSuggestion] = useState<LineupSuggestion | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const opponents = getOpponents(activities);

  const handleGenerateSuggestion = async () => {
    setIsGenerating(true);
    
    // Add small delay for UX
    setTimeout(() => {
      const newSuggestion = suggestOptimalLineup(players, activities, selectedFormation, selectedOpponent);
      setSuggestion(newSuggestion);
      setIsGenerating(false);
    }, 500);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600 bg-green-100";
    if (confidence >= 60) return "text-blue-600 bg-blue-100";
    if (confidence >= 40) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return "Hög";
    if (confidence >= 60) return "Medel";
    if (confidence >= 40) return "Låg";
    return "Mycket låg";
  };

  const gradeAnalysis = selectedOpponent ? analyzeOpponentGradeHistory(activities, selectedOpponent, players) : null;

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Optimal Startelva</h3>
        </div>
        
        <div className="p-4 border rounded-lg bg-blue-50">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-blue-500" />
            <span className="font-medium text-blue-800">Hur det fungerar</span>
          </div>
          <p className="text-sm text-blue-700">
            Algoritmen analyserar historiska kombinationer, individuell prestanda och positionssynergi 
            för att föreslå den optimala startelvan. Välj motståndare för smart nivåjustering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Välj formation</label>
            <FormationSelector 
              selectedFormation={selectedFormation}
              onFormationChange={setSelectedFormation}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Motståndare (valfritt)</label>
            <Select value={selectedOpponent} onValueChange={setSelectedOpponent}>
              <SelectTrigger>
                <SelectValue placeholder="Välj motståndare..." />
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
              onClick={handleGenerateSuggestion}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Genererar förslag...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Generera optimal lineup
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Grade Strategy Analysis (if opponent selected) */}
      {selectedOpponent && gradeAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              Nivåstrategi mot {selectedOpponent}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 border rounded-lg bg-purple-50">
              <p className="text-sm text-purple-700 font-medium mb-2">
                Smart nivåjustering aktiverad
              </p>
              <p className="text-sm text-purple-600">
                {gradeAnalysis.reasoning}
              </p>
              {gradeAnalysis.recommendedGradeAdjustment !== 0 && (
                <div className="mt-2">
                  <Badge className={
                    gradeAnalysis.recommendedGradeAdjustment > 0 
                      ? "bg-red-100 text-red-700" 
                      : "bg-green-100 text-green-700"
                  }>
                    {gradeAnalysis.recommendedGradeAdjustment > 0 ? '⬆ Högre nivå rekommenderas' : '⬇ Lägre nivå rekommenderas'}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formation Visualization */}
      {selectedFormation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Formation: {selectedFormation}</CardTitle>
          </CardHeader>
          <CardContent>
            <FormationField selectedFormation={selectedFormation} />
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
                  <Users className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Formation</div>
                    <div className="font-bold">{suggestion.formation}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Effektivitet</div>
                    <div className="font-bold">{suggestion.totalEfficiency.toFixed(2)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Förväntat vinst %</div>
                    <div className="font-bold">{suggestion.expectedWinRate.toFixed(0)}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 cursor-help">
                        <Info className="h-4 w-4 text-purple-500" />
                        <div>
                          <div className="text-sm text-muted-foreground">Tillförlitlighet</div>
                          <div className={`font-bold px-2 py-1 rounded text-xs ${getConfidenceColor(suggestion.confidence)}`}>
                            {getConfidenceLabel(suggestion.confidence)}
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Baserat på mängden tillgänglig historisk data</p>
                      <p>Tillförlitlighet: {suggestion.confidence.toFixed(0)}%</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardContent>
            </Card>
          </div>

          {/* Player Lineup */}
          <Card>
            <CardHeader>
              <CardTitle>Föreslagna spelare</CardTitle>
              <CardDescription>
                Optimal lineup baserat på historiska data och kombinationsanalys
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suggestion.players.map((player, index) => (
                  <div 
                    key={player.playerId}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Badge 
                          style={{ backgroundColor: getPositionColor(player.position as any) }}
                          className="text-white font-medium"
                        >
                          {player.position}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {getPositionLabel(player.position as any)}
                        </span>
                      </div>
                      
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
              <CardTitle className="text-base">Motivering</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {suggestion.reasoning.map((reason, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
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
            <h3 className="font-medium mb-2">Generera optimal lineup</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Välj en formation och klicka på "Generera optimal lineup" för att få förslag baserat på historiska data.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
