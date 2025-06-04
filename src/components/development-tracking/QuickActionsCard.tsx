
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  TrendingUp, 
  Filter, 
  Calendar,
  BarChart3,
  Target
} from "lucide-react";

interface QuickActionsCardProps {
  onActionClick: (action: string) => void;
  className?: string;
}

export function QuickActionsCard({ onActionClick, className = "" }: QuickActionsCardProps) {
  const actions = [
    {
      id: "view-all-players",
      label: "Visa alla spelare",
      icon: Users,
      description: "Detaljerad vy av alla spelares utveckling"
    },
    {
      id: "development-comparison",
      label: "Jämför utveckling",
      icon: BarChart3,
      description: "Jämför olika spelares utveckling"
    },
    {
      id: "set-goals",
      label: "Sätt utvecklingsmål",
      icon: Target,
      description: "Definiera utvecklingsmål för spelare"
    },
    {
      id: "filter-by-grade",
      label: "Filtrera per nivå",
      icon: Filter,
      description: "Se utveckling för specifika spelarnivåer"
    }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Snabbåtgärder
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className="h-auto p-3 flex flex-col items-start gap-2"
              onClick={() => onActionClick(action.id)}
            >
              <div className="flex items-center gap-2 w-full">
                <action.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{action.label}</span>
              </div>
              <span className="text-xs text-muted-foreground text-left">
                {action.description}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
