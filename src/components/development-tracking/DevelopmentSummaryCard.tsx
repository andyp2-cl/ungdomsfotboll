
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, Star, Target } from "lucide-react";
import { PlayerDevelopment } from "@/types/player";
import { DevelopmentChangeIndicator } from "./DevelopmentChangeIndicator";

interface DevelopmentSummaryCardProps {
  playerName: string;
  current?: PlayerDevelopment;
  previous?: PlayerDevelopment;
  lastUpdated?: string;
  className?: string;
}

export function DevelopmentSummaryCard({
  playerName,
  current,
  previous,
  lastUpdated,
  className = ""
}: DevelopmentSummaryCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Hitta största förbättringen och svagheten
  const getTopImprovement = () => {
    if (!current || !previous) return null;
    
    const categories = {
      technical: 'Teknik',
      gameUnderstanding: 'Spelförståelse', 
      passing: 'Passningsspel',
      offensive: 'Offensiv',
      defensive: 'Defensiv',
      mentality: 'Mentalitet',
      shooting: 'Skott',
      creativity: 'Kreativitet',
      leadership: 'Ledarskap'
    };
    
    let maxImprovement = 0;
    let topCategory = '';
    
    Object.entries(categories).forEach(([key, label]) => {
      const currentValue = current[key as keyof PlayerDevelopment] || 1;
      const previousValue = previous[key as keyof PlayerDevelopment] || 1;
      const improvement = currentValue - previousValue;
      
      if (improvement > maxImprovement) {
        maxImprovement = improvement;
        topCategory = label;
      }
    });
    
    return maxImprovement > 0.3 ? { category: topCategory, improvement: maxImprovement } : null;
  };

  const getWeakestArea = () => {
    if (!current) return null;
    
    const categories = {
      technical: 'Teknik',
      gameUnderstanding: 'Spelförståelse',
      passing: 'Passningsspel', 
      offensive: 'Offensiv',
      defensive: 'Defensiv',
      mentality: 'Mentalitet'
    };
    
    let minValue = 5;
    let weakestCategory = '';
    
    Object.entries(categories).forEach(([key, label]) => {
      const value = current[key as keyof PlayerDevelopment] || 1;
      if (value < minValue) {
        minValue = value;
        weakestCategory = label;
      }
    });
    
    return { category: weakestCategory, value: minValue };
  };

  const topImprovement = getTopImprovement();
  const weakestArea = getWeakestArea();

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Utvecklingssammanfattning
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status:</span>
          <DevelopmentChangeIndicator current={current} previous={previous} />
        </div>
        
        {lastUpdated && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Senast uppdaterad:</span>
            <div className="flex items-center gap-1 text-sm">
              <Calendar className="h-3 w-3" />
              {formatDate(lastUpdated)}
            </div>
          </div>
        )}

        {current && previous && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Genomsnitt nu</div>
              <div className="text-sm font-medium">
                {(Object.values(current).slice(0, 6).reduce((a, b) => a + b, 0) / 6).toFixed(1)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Genomsnitt förut</div>
              <div className="text-sm font-medium">
                {(Object.values(previous).slice(0, 6).reduce((a, b) => a + b, 0) / 6).toFixed(1)}
              </div>
            </div>
          </div>
        )}

        {/* Största förbättringen */}
        {topImprovement && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-3 w-3 text-green-600" />
              <span className="text-xs font-medium text-green-800">Största förbättringen</span>
            </div>
            <div className="text-sm">
              <span className="font-medium">{topImprovement.category}</span>
              <Badge variant="default" className="ml-2 bg-green-500">
                +{topImprovement.improvement.toFixed(1)}
              </Badge>
            </div>
          </div>
        )}

        {/* Svagaste området */}
        {weakestArea && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-3 w-3 text-yellow-600" />
              <span className="text-xs font-medium text-yellow-800">Utvecklingsområde</span>
            </div>
            <div className="text-sm">
              <span className="font-medium">{weakestArea.category}</span>
              <Badge variant="outline" className="ml-2">
                {weakestArea.value}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
