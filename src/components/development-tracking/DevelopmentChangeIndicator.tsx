
import React from "react";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { PlayerDevelopment } from "@/types/player";

interface DevelopmentChangeIndicatorProps {
  current?: PlayerDevelopment;
  previous?: PlayerDevelopment;
  className?: string;
}

export function DevelopmentChangeIndicator({
  current,
  previous,
  className = ""
}: DevelopmentChangeIndicatorProps) {
  if (!current || !previous) {
    return (
      <Badge variant="outline" className={className}>
        <Minus className="h-3 w-3 mr-1" />
        Ingen historik
      </Badge>
    );
  }

  // Beräkna genomsnittlig förändring
  const categories = ['technical', 'gameUnderstanding', 'passing', 'offensive', 'defensive', 'mentality'];
  let totalChange = 0;
  let changedCategories = 0;

  categories.forEach(category => {
    const currentValue = current[category as keyof PlayerDevelopment] || 1;
    const previousValue = previous[category as keyof PlayerDevelopment] || 1;
    const change = currentValue - previousValue;
    
    if (Math.abs(change) > 0.1) {
      totalChange += change;
      changedCategories++;
    }
  });

  const avgChange = changedCategories > 0 ? totalChange / changedCategories : 0;

  if (avgChange > 0.3) {
    return (
      <Badge variant="default" className={`bg-green-500 hover:bg-green-600 ${className}`}>
        <TrendingUp className="h-3 w-3 mr-1" />
        Förbättring
      </Badge>
    );
  } else if (avgChange < -0.3) {
    return (
      <Badge variant="destructive" className={className}>
        <TrendingDown className="h-3 w-3 mr-1" />
        Försämring
      </Badge>
    );
  } else {
    return (
      <Badge variant="outline" className={className}>
        <Minus className="h-3 w-3 mr-1" />
        Stabil
      </Badge>
    );
  }
}
