
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayerDevelopment } from "@/types/player";
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";

interface DevelopmentComparisonProps {
  current: PlayerDevelopment;
  previous?: PlayerDevelopment;
  playerName: string;
  className?: string;
}

export function DevelopmentComparison({
  current,
  previous,
  playerName,
  className = ""
}: DevelopmentComparisonProps) {
  if (!previous) {
    return (
      <Card className={className}>
        <CardContent className="py-8">
          <p className="text-muted-foreground text-center">
            Ingen tidigare utvecklingsdata tillgänglig för jämförelse
          </p>
        </CardContent>
      </Card>
    );
  }

  const categoryLabels = {
    // Kärnkategorier
    technical: 'Teknik',
    gameUnderstanding: 'Spelförståelse',
    passing: 'Passningsspel',
    offensive: 'Offensiv',
    defensive: 'Defensiv',
    mentality: 'Mentalitet',
    
    // Offensiva kategorier
    shooting: 'Skott',
    crossing: 'Inkast/Inlägg',
    finishing: 'Avslut',
    creativity: 'Kreativitet',
    
    // Defensiva kategorier
    tackling: 'Tacklingar',
    interception: 'Avbrott',
    positioning: 'Positionering',
    heading: 'Nickspel',
    
    // Fysiska kategorier
    speed: 'Hastighet',
    stamina: 'Uthållighet',
    strength: 'Styrka',
    
    // Mentala kategorier
    leadership: 'Ledarskap',
    composure: 'Lugn',
    workRate: 'Arbetsinsats'
  };

  const getChangeInfo = (currentValue: number, previousValue: number) => {
    const change = currentValue - previousValue;
    const changePercent = previousValue > 0 ? ((change / previousValue) * 100) : 0;
    
    let status: 'improved' | 'declined' | 'stable' = 'stable';
    let icon = <Minus className="h-3 w-3" />;
    let colorClass = 'text-gray-600';
    
    if (change > 0.3) {
      status = 'improved';
      icon = <TrendingUp className="h-3 w-3" />;
      colorClass = 'text-green-600';
    } else if (change < -0.3) {
      status = 'declined';
      icon = <TrendingDown className="h-3 w-3" />;
      colorClass = 'text-red-600';
    }
    
    return {
      change: Math.round(change * 10) / 10,
      changePercent: Math.round(changePercent * 10) / 10,
      status,
      icon,
      colorClass
    };
  };

  const categorizeChanges = () => {
    const improvements: string[] = [];
    const declines: string[] = [];
    const stable: string[] = [];

    Object.entries(categoryLabels).forEach(([key, label]) => {
      const currentValue = current[key as keyof PlayerDevelopment];
      const previousValue = previous[key as keyof PlayerDevelopment];
      const { status } = getChangeInfo(currentValue, previousValue);
      
      if (status === 'improved') improvements.push(label);
      else if (status === 'declined') declines.push(label);
      else stable.push(label);
    });

    return { improvements, declines, stable };
  };

  const { improvements, declines, stable } = categorizeChanges();

  // Beräkna genomsnittlig förändring
  const calculateAverageChange = () => {
    const coreCategories = ['technical', 'gameUnderstanding', 'passing', 'offensive', 'defensive', 'mentality'];
    const currentAvg = coreCategories.reduce((sum, cat) => sum + current[cat as keyof PlayerDevelopment], 0) / coreCategories.length;
    const previousAvg = coreCategories.reduce((sum, cat) => sum + previous[cat as keyof PlayerDevelopment], 0) / coreCategories.length;
    
    return {
      current: Math.round(currentAvg * 10) / 10,
      previous: Math.round(previousAvg * 10) / 10,
      change: Math.round((currentAvg - previousAvg) * 10) / 10
    };
  };

  const averageChange = calculateAverageChange();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Sammanfattning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Utvecklingssammanfattning - {playerName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{improvements.length}</div>
              <div className="text-sm text-muted-foreground">Förbättringar</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{declines.length}</div>
              <div className="text-sm text-muted-foreground">Försämringar</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{stable.length}</div>
              <div className="text-sm text-muted-foreground">Oförändrade</div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Genomsnittlig förändring:</span>
              <div className="flex items-center gap-2">
                <span>{averageChange.previous}</span>
                <ArrowRight className="h-4 w-4" />
                <span className="font-bold">{averageChange.current}</span>
                <Badge variant={averageChange.change > 0 ? "default" : averageChange.change < 0 ? "destructive" : "outline"}>
                  {averageChange.change > 0 ? '+' : ''}{averageChange.change}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detaljerad jämförelse */}
      <Card>
        <CardHeader>
          <CardTitle>Detaljerad jämförelse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(categoryLabels).map(([key, label]) => {
              const currentValue = current[key as keyof PlayerDevelopment];
              const previousValue = previous[key as keyof PlayerDevelopment];
              const changeInfo = getChangeInfo(currentValue, previousValue);
              
              return (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <span className="font-medium">{label}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Förut:</span>
                      <span className="font-medium">{previousValue}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Nu:</span>
                      <span className="font-medium">{currentValue}</span>
                    </div>
                    <div className={`flex items-center gap-1 min-w-[60px] ${changeInfo.colorClass}`}>
                      {changeInfo.icon}
                      <span className="text-sm font-medium">
                        {changeInfo.change > 0 ? '+' : ''}{changeInfo.change}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Kategoriserade förändringar */}
      <div className="grid gap-4 md:grid-cols-3">
        {improvements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Förbättringar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {improvements.map((improvement, index) => (
                  <Badge key={index} variant="default" className="bg-green-500 hover:bg-green-600">
                    {improvement}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {declines.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Försämringar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {declines.map((decline, index) => (
                  <Badge key={index} variant="destructive">
                    {decline}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {stable.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-600 flex items-center gap-2">
                <Minus className="h-4 w-4" />
                Oförändrade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stable.slice(0, 5).map((stableItem, index) => (
                  <Badge key={index} variant="outline">
                    {stableItem}
                  </Badge>
                ))}
                {stable.length > 5 && (
                  <p className="text-sm text-muted-foreground">
                    ...och {stable.length - 5} till
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
