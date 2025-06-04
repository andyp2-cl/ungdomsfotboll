
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface DevelopmentHeatmapProps {
  improvementData: Array<{
    category: string;
    improvement: number;
    playerCount: number;
  }>;
  className?: string;
}

export function DevelopmentHeatmap({ improvementData, className = "" }: DevelopmentHeatmapProps) {
  const getColorClass = (improvement: number) => {
    if (improvement > 0.5) return "bg-green-500";
    if (improvement > 0.2) return "bg-green-400";
    if (improvement > 0) return "bg-green-300";
    if (improvement === 0) return "bg-gray-300";
    if (improvement > -0.2) return "bg-red-300";
    if (improvement > -0.5) return "bg-red-400";
    return "bg-red-500";
  };

  const getIcon = (improvement: number) => {
    if (improvement > 0.1) return <TrendingUp className="h-3 w-3" />;
    if (improvement < -0.1) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Utvecklingsheatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {improvementData.map((item, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg text-white ${getColorClass(item.improvement)}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{item.category}</span>
                {getIcon(item.improvement)}
              </div>
              <div className="text-xs opacity-90">
                {item.improvement > 0 ? '+' : ''}{item.improvement.toFixed(1)}
              </div>
              <div className="text-xs opacity-75">
                {item.playerCount} spelare
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
