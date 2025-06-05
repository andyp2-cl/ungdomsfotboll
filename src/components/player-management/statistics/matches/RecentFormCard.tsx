
import React from "react";
import { Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface RecentFormCardProps {
  recentForm: (Activity & { result: string })[];
  onActivitySelect?: (activity: Activity) => void;
}

export function RecentFormCard({ recentForm, onActivitySelect }: RecentFormCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Senaste formen ({recentForm.length} matcher)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 flex-wrap">
          {recentForm.map((match, index) => (
            <div
              key={match.id}
              className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
              title={`${match.name} - ${formatDate(match.date)}`}
              onClick={() => onActivitySelect?.(match)}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                match.result === 'W' 
                  ? 'bg-green-500' 
                  : match.result === 'L' 
                    ? 'bg-red-500'
                    : 'bg-gray-500'
              }`}>
                {match.result}
              </div>
              <div className="text-xs text-center">
                <div className="font-medium">{match.homeScore}-{match.awayScore}</div>
                <div className="text-muted-foreground">{formatDate(match.date)}</div>
              </div>
            </div>
          ))}
        </div>
        {recentForm.length === 0 && (
          <div className="text-muted-foreground text-center py-4">
            Inga matcher att visa ännu
          </div>
        )}
      </CardContent>
    </Card>
  );
}
