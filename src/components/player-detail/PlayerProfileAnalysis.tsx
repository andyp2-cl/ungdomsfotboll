
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayerDevelopment, PlayerProfile } from "@/types/player";
import { TrendingUp, Shield, Target, Brain } from "lucide-react";

interface PlayerProfileAnalysisProps {
  development: PlayerDevelopment;
  playerName: string;
  className?: string;
}

export function PlayerProfileAnalysis({
  development,
  playerName,
  className = ""
}: PlayerProfileAnalysisProps) {
  
  const analyzePlayerProfile = (dev: PlayerDevelopment): PlayerProfile => {
    // Default values to prevent undefined errors
    const defaultDev = {
      technical: 1,
      gameUnderstanding: 1,
      passing: 1,
      offensive: 1,
      defensive: 1,
      mentality: 1,
      shooting: 1,
      crossing: 1,
      finishing: 1,
      creativity: 1,
      tackling: 1,
      interception: 1,
      positioning: 1,
      heading: 1,
      speed: 1,
      stamina: 1,
      strength: 1,
      leadership: 1,
      composure: 1,
      workRate: 1,
      ...dev // Override with actual values
    };

    // Calculate category averages
    const offensiveScore = (
      defaultDev.offensive + 
      defaultDev.shooting + 
      defaultDev.finishing + 
      defaultDev.creativity +
      defaultDev.crossing
    ) / 5;

    const defensiveScore = (
      defaultDev.defensive + 
      defaultDev.tackling + 
      defaultDev.interception + 
      defaultDev.positioning +
      defaultDev.heading
    ) / 5;

    const technicalScore = (
      defaultDev.technical + 
      defaultDev.passing + 
      defaultDev.gameUnderstanding
    ) / 3;

    const physicalScore = (
      defaultDev.speed + 
      defaultDev.stamina + 
      defaultDev.strength
    ) / 3;

    const mentalScore = (
      defaultDev.mentality + 
      defaultDev.leadership + 
      defaultDev.composure +
      defaultDev.workRate
    ) / 4;

    // Determine primary profile
    const scores = {
      offensive: offensiveScore,
      defensive: defensiveScore,
      technical: technicalScore,
      physical: physicalScore,
      mental: mentalScore
    };

    const maxScore = Math.max(...Object.values(scores));
    const maxKey = Object.keys(scores).find(key => scores[key as keyof typeof scores] === maxScore) as keyof typeof scores;

    // Determine profile type based on highest category
    let type: PlayerProfile['type'] = 'balanced';
    if (offensiveScore > defensiveScore + 1) {
      type = 'offensive';
    } else if (defensiveScore > offensiveScore + 1) {
      type = 'defensive';
    } else if (technicalScore >= 7) {
      type = 'technical';
    } else if (physicalScore >= 7) {
      type = 'physical';
    }

    // Generate strengths
    const strengths: string[] = [];
    if (defaultDev.shooting >= 7) strengths.push('Skott');
    if (defaultDev.passing >= 7) strengths.push('Passning');
    if (defaultDev.tackling >= 7) strengths.push('Tacklingar');
    if (defaultDev.speed >= 7) strengths.push('Snabbhet');
    if (defaultDev.leadership >= 7) strengths.push('Ledarskap');
    if (defaultDev.gameUnderstanding >= 7) strengths.push('Spelförståelse');

    // Generate recommendations
    const recommendations: string[] = [];
    if (defaultDev.shooting < 5) recommendations.push('Träna skotteknik');
    if (defaultDev.defensive < 5) recommendations.push('Förbättra defensivt spel');
    if (defaultDev.mentality < 5) recommendations.push('Utveckla mental styrka');
    if (defaultDev.speed < 5) recommendations.push('Arbeta med snabbhet');

    const descriptions = {
      offensive: `${playerName} är en offensiv spelare med stark förmåga att skapa och avsluta målchanser.`,
      defensive: `${playerName} är en defensiv spelare med god förmåga att stoppa motståndare och vinna bollar.`,
      technical: `${playerName} är en teknisk spelare med utmärkt bollkontroll och spelförståelse.`,
      physical: `${playerName} är en fysisk spelare med god snabbhet, styrka och uthållighet.`,
      balanced: `${playerName} är en balanserad spelare med jämna färdigheter inom alla områden.`
    };

    return {
      type,
      score: maxScore,
      description: descriptions[type],
      strengths: strengths.slice(0, 3),
      recommendations: recommendations.slice(0, 3)
    };
  };

  const profile = analyzePlayerProfile(development);

  const getProfileIcon = (type: PlayerProfile['type']) => {
    switch (type) {
      case 'offensive': return <Target className="h-4 w-4" />;
      case 'defensive': return <Shield className="h-4 w-4" />;
      case 'technical': return <Brain className="h-4 w-4" />;
      default: return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getProfileColor = (type: PlayerProfile['type']) => {
    switch (type) {
      case 'offensive': return 'bg-red-100 text-red-800';
      case 'defensive': return 'bg-blue-100 text-blue-800';
      case 'technical': return 'bg-purple-100 text-purple-800';
      case 'physical': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProfileLabel = (type: PlayerProfile['type']) => {
    switch (type) {
      case 'offensive': return 'Offensiv';
      case 'defensive': return 'Defensiv';
      case 'technical': return 'Teknisk';
      case 'physical': return 'Fysisk';
      default: return 'Balanserad';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getProfileIcon(profile.type)}
          Spelaranalys
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Profile Badge */}
        <div className="flex items-center gap-2">
          <Badge className={getProfileColor(profile.type)}>
            {getProfileLabel(profile.type)} ({profile.score.toFixed(1)}/10)
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground">{profile.description}</p>

        {/* Strengths */}
        {profile.strengths.length > 0 && (
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
        )}

        {/* Recommendations */}
        {profile.recommendations.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">Utvecklingsområden</h4>
            <div className="space-y-1">
              {profile.recommendations.map((rec, index) => (
                <p key={index} className="text-xs text-muted-foreground">• {rec}</p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
