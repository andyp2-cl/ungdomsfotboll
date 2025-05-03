import { Card, CardContent } from "@/components/ui/card";
import { Activity, Player } from "@/types/player";
import { ActivityParticipants } from "./ActivityParticipants";
import { Calendar, Clock, Map, Trophy, Users, Award } from "lucide-react";
import { CupMatchBadge } from "./CupMatchBadge";
import { GradePieChart } from "../activity-detail/match-result/GradePieChart"; 
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

interface ActivityListItemProps {
  activity: Activity;
  players: Player[];
  onSelect: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
  isHistorical?: boolean;
  isMobile?: boolean; // Add isMobile prop to the interface
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
  
  const formattedDate = new Date(date).toLocaleDateString('sv-SE');
  const dayOfWeek = new Date(date).toLocaleDateString('sv-SE', { weekday: 'long' });
  const capitalizedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
  
  let resultMessage = '';
  if (isHistorical && activity.result) {
    resultMessage = `Resultat: ${activity.result}`;
  } else if (isHistorical && activity.homeScore !== undefined && activity.awayScore !== undefined) {
    resultMessage = `Resultat: ${activity.homeScore}-${activity.awayScore}`;
  }
  
  const getResultTextColor = () => {
    // If scores are equal (draw)
    if (activity.homeScore === activity.awayScore && 
        activity.homeScore !== undefined && 
        activity.awayScore !== undefined) {
      return "text-gray-600";
    }
    
    // Use the explicit isWin flag if available
    if (activity.isWin === true) {
      return "text-green-600"; // Win
    } else if (activity.isWin === false) {
      return "text-red-600"; // Loss
    }
    
    // If isWin is not available, fall back to calculating based on scores
    if (activity.homeScore !== undefined && activity.awayScore !== undefined) {
      const isHome = isHomeMatch(activity);
      if (isHome) {
        return activity.homeScore > activity.awayScore ? "text-green-600" : "text-red-600";
      } else {
        return activity.awayScore > activity.homeScore ? "text-green-600" : "text-red-600";
      }
    }
    
    return "";
  };
  
  const isCupMatch = activity.cupId ? true : false;
  
  const participantPlayers = participants
    .map(id => players.find(p => p.id === id))
    .filter(player => player !== undefined) as Player[];

  const showGradeChart = participantPlayers.length > 0;
  
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
              <h3 className={`font-bold ${isMobileView ? 'text-base' : ''} flex items-center flex-wrap gap-2`}>
                {name}
                {isCupMatch && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Trophy className="h-3.5 w-3.5" />
                    Cupmatch
                  </Badge>
                )}
                {league && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Award className="h-3.5 w-3.5" />
                    {league.name}
                  </Badge>
                )}
              </h3>
            </div>
            
            <div className={`flex flex-wrap gap-2 text-sm mt-2 ${isMobileView ? 'text-xs' : ''}`}>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className={`${isMobileView ? 'h-3 w-3' : 'h-4 w-4'}`} />
                <span>{capitalizedDayOfWeek} {formattedDate}</span>
              </div>
              
              {time && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className={`${isMobileView ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  <span>{time}</span>
                </div>
              )}
              
              {location?.name && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Map className={`${isMobileView ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  <span>{location.name}</span>
                </div>
              )}
            </div>
            
            <div className={`${isMobileView ? 'mt-2' : 'mt-3'}`}>
              <ActivityParticipants 
                participants={participantPlayers} 
                onPlayerSelect={onPlayerSelect}
                totalCount={participants.length}
                isMobile={isMobileView}
              />
            </div>
          </div>

          <div className="md:w-48 flex flex-col items-end justify-start">
            {resultMessage && (
              <div className={`${isMobileView ? 'text-base font-medium mb-2' : 'text-sm font-medium mb-3'} ${getResultTextColor()}`}>
                {resultMessage}
              </div>
            )}
            
            <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
              <Users className={`${isMobileView ? 'h-3 w-3' : 'h-4 w-4'}`} />
              <span className={isMobileView ? 'text-xs' : ''}>{participants.length} deltagare</span>
            </div>

            {showGradeChart && !isMobileView && (
              <div className="w-24 h-24 overflow-hidden">
                <GradePieChart 
                  activity={activity} 
                  participatingPlayers={participantPlayers} 
                />
              </div>
            )}
            
            {showGradeChart && isMobileView && (
              <div className="w-16 h-16 overflow-hidden">
                <GradePieChart 
                  activity={activity} 
                  participatingPlayers={participantPlayers} 
                  compact={true}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
