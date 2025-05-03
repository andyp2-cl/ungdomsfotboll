
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Player } from "@/types/player";
import { ActivityParticipants } from "./ActivityParticipants";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { ActivityHeader } from "./ActivityHeader";
import { ActivityMetadata } from "./ActivityMetadata";
import { ActivitySidebar } from "./ActivitySidebar";

interface ActivityListItemProps {
  activity: Activity;
  players: Player[];
  onSelect: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
  isHistorical?: boolean;
  isMobile?: boolean;
}

export function ActivityListItem({ 
  activity, 
  players, 
  onSelect,
  onPlayerSelect,
  isHistorical = false,
  isMobile
}: ActivityListItemProps) {
  // Use the hook only if isMobile is not provided
  const mobileFromHook = useIsMobile();
  // Use passed isMobile prop if provided, otherwise use the hook value
  const isMobileView = isMobile !== undefined ? isMobile : mobileFromHook;
  
  const { name, date, time, location, participants = [] } = activity;
  
  // Fetch league info if we have a league ID
  const { data: league } = useQuery({
    queryKey: ["league", activity.leagueId],
    queryFn: async () => {
      if (!activity.leagueId) return null;
      
      const { data, error } = await supabase
        .from("leagues")
        .select("*")
        .eq("id", activity.leagueId)
        .single();
        
      if (error) {
        console.error("Error fetching league:", error);
        return null;
      }
      
      return data;
    },
    enabled: !!activity.leagueId
  });
  
  const isCupMatch = activity.cupId ? true : false;
  
  const participantPlayers = participants
    .map(id => players.find(p => p.id === id))
    .filter(player => player !== undefined) as Player[];

  const handleCardClick = () => {
    // Scroll to the top of the window before selecting the activity
    window.scrollTo(0, 0);
    onSelect(activity);
  };
  
  return (
    <Card 
      className="border cursor-pointer relative hover:bg-accent hover:text-accent-foreground transition-colors"
      onClick={handleCardClick}
    >
      <CardContent className={`${isMobileView ? 'p-3' : 'p-4'}`}>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex flex-col">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <ActivityHeader 
                name={name} 
                isMobile={isMobileView} 
                isCupMatch={isCupMatch} 
                leagueName={league?.name}
              />
            </div>
            
            <ActivityMetadata 
              date={date} 
              time={time} 
              locationName={location?.name}
              isMobile={isMobileView}
            />
            
            <div className={`${isMobileView ? 'mt-2' : 'mt-3'}`}>
              <ActivityParticipants 
                participants={participantPlayers} 
                onPlayerSelect={onPlayerSelect}
                totalCount={participants.length}
                isMobile={isMobileView}
              />
            </div>
          </div>

          <ActivitySidebar 
            activity={activity}
            participantPlayers={participantPlayers}
            participantCount={participants.length}
            isMobile={isMobileView}
          />
        </div>
      </CardContent>
    </Card>
  );
}
