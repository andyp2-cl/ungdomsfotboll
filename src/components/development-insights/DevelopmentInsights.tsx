
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, Target } from "lucide-react";
import { PlayerDevelopment } from "@/types/player";

interface DevelopmentInsight {
  type: 'improvement' | 'decline' | 'stagnant' | 'goal';
  category: string;
  message: string;
  value?: number;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

interface DevelopmentInsightsProps {
  currentDevelopment: PlayerDevelopment;
  previousDevelopment?: PlayerDevelopment;
  playerName: string;
  className?: string;
}

export function DevelopmentInsights({
  currentDevelopment,
  previousDevelopment,
  playerName,
  className = ""
}: DevelopmentInsightsProps) {

  const generateInsights = (): DevelopmentInsight[] => {
    const insights: DevelopmentInsight[] = [];

    if (previousDevelopment) {
      // Compare with previous development
      const categories = [
        { key: 'technical', label: 'Teknik' },
        { key: 'offensive', label: 'Offensiv' },
        { key: 'defensive', label: 'Defensiv' },
        { key: 'mentality', label: 'Mentalitet' },
        { key: 'shooting', label: 'Skott' },
        { key: 'leadership', label: 'Ledarskap' }
      ];

      categories.forEach(category => {
        const current = currentDevelopment[category.key as keyof PlayerDevelopment] || 1;
        const previous = previousDevelopment[category.key as keyof PlayerDevelopment] || 1;
        const change = current - previous;

        if (Math.abs(change) >= 0.5) {
          if (change > 0) {
            insights.push({
              type: 'improvement',
              category: category.label,
              message: `${playerName} har förbättrats med ${change.toFixed(1)} poäng i ${category.label}`,
              value: current,
              change: change,
              icon: <TrendingUp className="h-4 w-4" />,
              color: 'text-green-600'
            });
          } else {
            insights.push({
              type: 'decline',
              category: category.label,
              message: `${playerName} har minskat med ${Math.abs(change).toFixed(1)} poäng i ${category.label}`,
              value: current,
              change: change,
              icon: <TrendingDown className="h-4 w-4" />,
              color: 'text-red-600'
            });
          }
        }
      });
    }

    // Identify areas needing attention
    const weakAreas = Object.entries(currentDevelopment)
      .filter(([_, value]) => value < 4)
      .slice(0, 2);

    weakAreas.forEach(([key, value]) => {
      const labels: Record<string, string> = {
        technical: 'Teknik',
        offensive: 'Offensiv',
        defensive: 'Defensiv',
        mentality: 'Mentalitet',
        shooting: 'Skott',
        leadership: 'Ledarskap'
      };

      insights.push({
        type: 'goal',
        category: labels[key] || key,
        message: `${labels[key] || key} behöver förbättras (${value.toFixed(1)}/10)`,
        value: value,
        icon: <Target className="h-4 w-4" />,
        color: 'text-orange-600'
      });
    });

    // Identify strong areas
    const strongAreas = Object.entries(currentDevelopment)
      .filter(([_, value]) => value >= 8)
      .slice(0, 2);

    strongAreas.forEach(([key, value]) => {
      const labels: Record<string, string> = {
        technical: 'Teknik',
        offensive: 'Offensiv',
        defensive: 'Defensiv',
        mentality: 'Mentalitet',
        shooting: 'Skott',
        leadership: 'Ledarskap'
      };

      insights.push({
        type: 'improvement',
        category: labels[key] || key,
        message: `Stark i ${labels[key] || key} (${value.toFixed(1)}/10)`,
        value: value,
        icon: <TrendingUp className="h-4 w-4" />,
        color: 'text-blue-600'
      });
    });

    return insights.slice(0, 6); // Limit to 6 insights
  };

  const insights = generateInsights();

  const getInsightBadgeVariant = (type: DevelopmentInsight['type']) => {
    switch (type) {
      case 'improvement': return 'default';
      case 'decline': return 'destructive';
      case 'goal': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Utvecklingsinsikter
        </CardTitle>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Inga utvecklingsinsikter tillgängliga. Lägg till mer historisk data för att se trender.
          </p>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className={insight.color}>
                  {insight.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getInsightBadgeVariant(insight.type)} className="text-xs">
                      {insight.category}
                    </Badge>
                    {insight.value && (
                      <span className="text-xs text-muted-foreground">
                        {insight.value.toFixed(1)}/10
                      </span>
                    )}
                    {insight.change && (
                      <span className={`text-xs ${insight.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {insight.change > 0 ? '+' : ''}{insight.change.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm">{insight.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
