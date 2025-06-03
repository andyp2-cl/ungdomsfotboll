
import { useState } from "react";
import { Activity, Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActivityListWithMonthGrouping } from "@/components/activity-list/ActivityListWithMonthGrouping";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Trophy, Calendar } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CupWithMatches {
  id: string;
  name: string;
  year: number;
  date: string;
  matches: Activity[];
  wins: number;
  draws: number;
  losses: number;
}

interface CupsListProps {
  cups: CupWithMatches[];
  players: Player[];
  onActivitySelect?: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
}

export function CupsList({ 
  cups, 
  players, 
  onActivitySelect, 
  onPlayerSelect 
}: CupsListProps) {
  const [expandedCups, setExpandedCups] = useState<Set<string>>(
    new Set(cups.slice(0, 2).map(cup => cup.id)) // Expand first 2 cups by default
  );
  const isMobile = useIsMobile();

  const toggleCup = (cupId: string) => {
    setExpandedCups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cupId)) {
        newSet.delete(cupId);
      } else {
        newSet.add(cupId);
      }
      return newSet;
    });
  };

  const getWinRate = (wins: number, draws: number, losses: number) => {
    const total = wins + draws + losses;
    return total > 0 ? Math.round((wins / total) * 100) : 0;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE');
  };

  return (
    <div className="space-y-4">
      {cups.map((cup) => {
        const isExpanded = expandedCups.has(cup.id);
        const totalMatches = cup.wins + cup.draws + cup.losses;
        const winRate = getWinRate(cup.wins, cup.draws, cup.losses);

        return (
          <Card key={cup.id} className="overflow-hidden">
            <Collapsible open={isExpanded} onOpenChange={() => toggleCup(cup.id)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Trophy className="h-5 w-5 text-amber-500" />
                      <div>
                        <CardTitle className="text-left text-lg">{cup.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{formatDate(cup.date)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="bg-green-50 border-green-200">
                        {cup.wins}V
                      </Badge>
                      <Badge variant="outline" className="bg-yellow-50 border-yellow-200">
                        {cup.draws}O
                      </Badge>
                      <Badge variant="outline" className="bg-red-50 border-red-200">
                        {cup.losses}F
                      </Badge>
                      {totalMatches > 0 && (
                        <Badge variant="secondary">
                          {winRate}% vinst
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {totalMatches} matcher
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  {cup.matches.length > 0 ? (
                    <ActivityListWithMonthGrouping
                      activities={cup.matches}
                      players={players}
                      onSelect={onActivitySelect}
                      onPlayerSelect={onPlayerSelect}
                      isHistorical={true}
                      isMobile={isMobile}
                      noResultsMessage="Inga matcher i denna cup"
                    />
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">
                      Inga matcher registrerade för denna cup
                    </p>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
      
      {cups.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Inga cuper hittades</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
