
import { Activity, Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CupsList } from "./components/CupsList";

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

const getCupsWithMatches = (
  activities: Activity[], 
  players: Player[]
): CupWithMatches[] => {
  // Get all cup activities
  const cupActivities = activities.filter(activity => activity.type === 'cup');
  
  // Get all cup matches (matches that reference a cup)
  const cupMatches = activities.filter(activity => 
    activity.type === 'match' && (activity.cupId || activity.cupName)
  );
  
  console.log(`Found ${cupActivities.length} cup activities and ${cupMatches.length} cup matches`);
  
  const cupsWithMatches: CupWithMatches[] = [];
  
  // Process direct cup activities
  cupActivities.forEach(cupActivity => {
    // Find matches that belong to this cup
    const relatedMatches = cupMatches.filter(match => 
      match.cupId === cupActivity.id || match.cupName === cupActivity.name
    );
    
    let wins = 0;
    let draws = 0;
    let losses = 0;
    
    relatedMatches.forEach(match => {
      if (match.homeScore !== undefined && match.awayScore !== undefined && 
          match.homeScore === match.awayScore) {
        draws++;
      } else if (match.isWin === true) {
        wins++;
      } else if (match.isWin === false) {
        losses++;
      }
    });
    
    // Extract year from cup name or use current year
    let year = new Date().getFullYear();
    const yearMatch = cupActivity.name.match(/(\d{4})/);
    if (yearMatch) {
      year = parseInt(yearMatch[1]);
    }
    
    cupsWithMatches.push({
      id: cupActivity.id,
      name: cupActivity.name,
      year,
      date: cupActivity.date,
      matches: relatedMatches,
      wins,
      draws,
      losses
    });
  });
  
  // Also check for cup matches that don't have a corresponding cup activity
  const orphanedCupNames = new Set<string>();
  cupMatches.forEach(match => {
    if (match.cupName && !cupsWithMatches.some(cup => cup.name === match.cupName)) {
      orphanedCupNames.add(match.cupName);
    }
  });
  
  // Create cup entries for orphaned cup matches
  orphanedCupNames.forEach(cupName => {
    const relatedMatches = cupMatches.filter(match => match.cupName === cupName);
    
    let wins = 0;
    let draws = 0;
    let losses = 0;
    
    relatedMatches.forEach(match => {
      if (match.homeScore !== undefined && match.awayScore !== undefined && 
          match.homeScore === match.awayScore) {
        draws++;
      } else if (match.isWin === true) {
        wins++;
      } else if (match.isWin === false) {
        losses++;
      }
    });
    
    // Extract year from cup name or use current year
    let year = new Date().getFullYear();
    const yearMatch = cupName.match(/(\d{4})/);
    if (yearMatch) {
      year = parseInt(yearMatch[1]);
    }
    
    // Use the earliest match date as the cup date
    const earliestMatch = relatedMatches.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )[0];
    
    cupsWithMatches.push({
      id: `orphaned-${cupName}`,
      name: cupName,
      year,
      date: earliestMatch?.date || new Date().toISOString().split('T')[0],
      matches: relatedMatches,
      wins,
      draws,
      losses
    });
  });
  
  // Sort by date (newest first)
  return cupsWithMatches.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });
};

interface CupsTabContentProps {
  activities: Activity[];
  players: Player[];
  onActivitySelect?: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
}

export function CupsTabContent({ 
  activities,
  players,
  onActivitySelect,
  onPlayerSelect
}: CupsTabContentProps) {
  const cupsWithMatches = getCupsWithMatches(activities, players);

  if (cupsWithMatches.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Inga cupmatcher hittades. Kontrollera aktiviteterna.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Cupmatcher</CardTitle>
        </CardHeader>
        <CardContent>
          <CupsList 
            cups={cupsWithMatches}
            players={players}
            onActivitySelect={onActivitySelect}
            onPlayerSelect={onPlayerSelect}
          />
        </CardContent>
      </Card>
    </div>
  );
}
