
import { Activity, Player } from "@/types/player";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ActivityList } from "@/components/ActivityList";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

interface LeagueCardProps {
  league: {
    id: string;
    name: string;
    division: string;
    year: number;
    matches: Activity[];
    wins: number;
    draws: number;
    losses: number;
  };
  players: Player[];
  onActivitySelect?: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
}

// Colors matching badges: green for wins, gray for draws, red for losses
const COLORS = ['#16a34a', '#9F9EA1', '#dc2626'];

export function LeagueCard({ league, players, onActivitySelect, onPlayerSelect }: LeagueCardProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Format league name correctly - year and name separately, remove duplicate year
  const formattedLeagueName = `${league.year} ${league.name}`;

  const handleActivityClick = (activity: Activity) => {
    // Navigate to the activities page with the selected activity
    navigate('/activities', { state: { selectedActivityId: activity.id } });
  };

  const renderPieChart = () => {
    const data = [
      { name: 'Vinster', value: league.wins },
      { name: 'Oavgjorda', value: league.draws },
      { name: 'Förluster', value: league.losses }
    ];

    const totalMatches = league.wins + league.draws + league.losses;
    if (totalMatches === 0) return null;

    return (
      <div className="w-24 h-24">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={15}
              outerRadius={30}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <AccordionItem value={league.id} className="border rounded-lg">
      <AccordionTrigger className="px-4 hover:no-underline [&[data-state=open]>svg]:rotate-180">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <span>{formattedLeagueName} ({league.division})</span>
            <div className="flex items-center space-x-1 text-sm">
              <Badge variant="success" className="text-xs">
                {league.wins}
              </Badge>
              <Badge variant="secondary" className="text-xs bg-gray-400 text-white">
                {league.draws}
              </Badge>
              <Badge variant="destructive" className="text-xs">
                {league.losses}
              </Badge>
            </div>
          </div>
          {renderPieChart()}
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        {league.matches.length > 0 ? (
          <ActivityList
            activities={league.matches}
            players={players}
            onSelect={handleActivityClick}
            onPlayerSelect={onPlayerSelect}
            isHistorical={true}
            isMobile={isMobile}
            noResultsMessage="Inga matcher har lagts till i denna liga ännu."
          />
        ) : (
          <p className="text-center text-muted-foreground py-4">
            Inga matcher har lagts till i denna liga ännu.
          </p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
