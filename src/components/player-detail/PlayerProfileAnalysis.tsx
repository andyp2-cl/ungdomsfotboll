
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerDevelopment, PlayerProfile, PlayerPosition } from "@/types/player";
import { Shield, Zap, Target, Brain, Dumbbell, Star } from "lucide-react";

interface PlayerProfileAnalysisProps {
  development: PlayerDevelopment;
  positions?: PlayerPosition[];
  className?: string;
}

// Position weights for different attributes
const POSITION_WEIGHTS = {
  MV: {
    defensive: 1.5,
    positioning: 1.8,
    composure: 1.3,
    leadership: 1.2
  },
  BACK: {
    defensive: 1.4,
    tackling: 1.5,
    heading: 1.3,
    speed: 1.2,
    positioning: 1.3
  },
  MF: {
    passing: 1.3,
    gameUnderstanding: 1.4,
    creativity: 1.2,
    workRate: 1.3,
    stamina: 1.2
  },
  ANF: {
    offensive: 1.4,
    shooting: 1.5,
    finishing: 1.6,
    speed: 1.3,
    crossing: 1.2
  }
};

export function PlayerProfileAnalysis({
  development,
  positions = [],
  className = ""
}: PlayerProfileAnalysisProps) {
  
  const calculateProfile = (): PlayerProfile => {
    // Calculate weighted scores based on position
    const primaryPosition = positions[0] as keyof typeof POSITION_WEIGHTS;
    const weights = POSITION_WEIGHTS[primaryPosition] || {};
    
    // Core category calculations
    const offensiveScore = (
      (development.offensive || 1) + 
      (development.shooting || 1) + 
      (development.finishing || 1) + 
      (development.crossing || 1) +
      (development.creativity || 1)
    ) / 5;
    
    const defensiveScore = (
      (development.defensive || 1) + 
      (development.tackling || 1) + 
      (development.interception || 1) + 
      (development.heading || 1) +
      (development.positioning || 1)
    ) / 5;
    
    const technicalScore = (
      (development.technical || 1) + 
      (development.passing || 1) + 
      (development.gameUnderstanding || 1) +
      (development.creativity || 1)
    ) / 4;
    
    const physicalScore = (
      (development.speed || 1) + 
      (development.stamina || 1) + 
      (development.strength || 1)
    ) / 3;
    
    const mentalScore = (
      (development.mentality || 1) + 
      (development.leadership || 1) + 
      (development.composure || 1) +
      (development.workRate || 1)
    ) / 4;
    
    // Apply position weights
    const weightedOffensive = offensiveScore * (weights.offensive || 1);
    const weightedDefensive = defensiveScore * (weights.defensive || 1);
    
    // Determine profile type
    const scoreDiff = Math.abs(weightedOffensive - weightedDefensive);
    
    if (scoreDiff < 1.5) {
      return {
        type: 'balanced',
        score: (offensiveScore + defensiveScore) / 2,
        description: 'Balanserad spelare',
        strengths: getTopStrengths(development),
        recommendations: getBalancedRecommendations(development)
      };
    } else if (weightedOffensive > weightedDefensive) {
      return {
        type: 'offensive',
        score: offensiveScore,
        description: 'Offensiv spelare',
        strengths: getOffensiveStrengths(development),
        recommendations: getOffensiveRecommendations(development)
      };
    } else {
      return {
        type: 'defensive',
        score: defensiveScore,
        description: 'Defensiv spelare',
        strengths: getDefensiveStrengths(development),
        recommendations: getDefensiveRecommendations(development)
      };
    }
  };

  const getTopStrengths = (dev: PlayerDevelopment): string[] => {
    const allValues = [
      { key: 'shooting', value: dev.shooting || 1, label: 'Skott' },
      { key: 'finishing', value: dev.finishing || 1, label: 'Avslut' },
      { key: 'crossing', value: dev.crossing || 1, label: 'Inlägg' },
      { key: 'tackling', value: dev.tackling || 1, label: 'Tacklingar' },
      { key: 'interception', value: dev.interception || 1, label: 'Avbrott' },
      { key: 'positioning', value: dev.positioning || 1, label: 'Positionering' },
      { key: 'speed', value: dev.speed || 1, label: 'Snabbhet' },
      { key: 'leadership', value: dev.leadership || 1, label: 'Ledarskap' },
      { key: 'creativity', value: dev.creativity || 1, label: 'Kreativitet' }
    ];
    
    return allValues
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map(item => item.label);
  };

  const getOffensiveStrengths = (dev: PlayerDevelopment): string[] => {
    const strengths = [];
    if ((dev.shooting || 1) >= 7) strengths.push('Målskytte');
    if ((dev.finishing || 1) >= 7) strengths.push('Avslut');
    if ((dev.crossing || 1) >= 7) strengths.push('Inlägg');
    if ((dev.creativity || 1) >= 7) strengths.push('Kreativitet');
    if ((dev.speed || 1) >= 7) strengths.push('Snabbhet');
    return strengths.slice(0, 3);
  };

  const getDefensiveStrengths = (dev: PlayerDevelopment): string[] => {
    const strengths = [];
    if ((dev.tackling || 1) >= 7) strengths.push('Tacklingar');
    if ((dev.interception || 1) >= 7) strengths.push('Avbrott');
    if ((dev.heading || 1) >= 7) strengths.push('Huvudspel');
    if ((dev.positioning || 1) >= 7) strengths.push('Positionering');
    if ((dev.strength || 1) >= 7) strengths.push('Styrka');
    return strengths.slice(0, 3);
  };

  const getOffensiveRecommendations = (dev: PlayerDevelopment): string[] => {
    const recs = [];
    if ((dev.shooting || 1) < 6) recs.push('Träna skottteknik');
    if ((dev.crossing || 1) < 6) recs.push('Förbättra inläggsspelet');
    if ((dev.speed || 1) < 6) recs.push('Utveckla snabbhet');
    return recs.slice(0, 2);
  };

  const getDefensiveRecommendations = (dev: PlayerDevelopment): string[] => {
    const recs = [];
    if ((dev.tackling || 1) < 6) recs.push('Träna tacklingstekniken');
    if ((dev.positioning || 1) < 6) recs.push('Förbättra positioneringen');
    if ((dev.interception || 1) < 6) recs.push('Utveckla avbrottsspelet');
    return recs.slice(0, 2);
  };

  const getBalancedRecommendations = (dev: PlayerDevelopment): string[] => {
    const recs = [];
    if ((dev.gameUnderstanding || 1) < 6) recs.push('Utveckla spelförståelsen');
    if ((dev.workRate || 1) < 6) recs.push('Förbättra arbetsmoralen');
    return recs.slice(0, 2);
  };

  const profile = calculateProfile();

  const getProfileIcon = (type: string) => {
    switch (type) {
      case 'offensive': return <Target className="h-4 w-4" />;
      case 'defensive': return <Shield className="h-4 w-4" />;
      case 'technical': return <Brain className="h-4 w-4" />;
      case 'physical': return <Dumbbell className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getProfileColor = (type: string) => {
    switch (type) {
      case 'offensive': return 'bg-red-100 text-red-800 border-red-200';
      case 'defensive': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'technical': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'physical': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getProfileIcon(profile.type)}
          Spelarprofil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className={getProfileColor(profile.type)}>
            {profile.description}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Poäng: {profile.score.toFixed(1)}
          </span>
        </div>

        <div>
          <h4 className="font-medium text-sm mb-2">Styrkor</h4>
          <div className="flex flex-wrap gap-1">
            {profile.strengths.map((strength, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {strength}
              </Badge>
            ))}
          </div>
        </div>

        {profile.recommendations.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">Utvecklingsområden</h4>
            <div className="space-y-1">
              {profile.recommendations.map((rec, index) => (
                <p key={index} className="text-xs text-muted-foreground">
                  • {rec}
                </p>
              ))}
            </div>
          </div>
        )}

        {positions.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">Föreslagna positioner</h4>
            <div className="flex flex-wrap gap-1">
              {positions.map((pos, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {pos}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
