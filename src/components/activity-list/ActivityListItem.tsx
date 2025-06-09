
import React from "react";
import { Activity, Player } from "@/types/player";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, Trophy, Award } from "lucide-react";
import { ActivityMeta } from "./ActivityMeta";
import { ActivityParticipants } from "./ActivityParticipants";
import { CupMatchBadge } from "./CupMatchBadge";
import { MatchReportSummary } from "./MatchReportSummary";
import { ActivityStatsWidget } from "./components/ActivityStatsWidget";
import { GoalAssistDisplay } from "./components/GoalAssistDisplay";
import { ShareMatchCard } from "@/components/share/ShareMatchCard";
import { formatResult, getResultTextColor } from "./utils/result-utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

interface ActivityListItemProps {
  activity: Activity;
  players: Player[];
  onClick?: () => void;
  onSelect?: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
  isHistorical?: boolean;
  isMobile?: boolean;
  allActivities?: Activity[]; // For weekly match calculations
}

export function ActivityListItem({ 
  activity, 
  players, 
  onClick, 
  onSelect,
  onPlayerSelect,
  isHistorical = false,
  isMobile = false,
  allActivities = []
}: ActivityListItemProps) {
  const actualIsHistorical = isHistorical || new Date(activity.date) < new Date();
  const participatingPlayers = players.filter(player => 
    activity.participants?.includes(player.id)
  );

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

  // Function to clean league name - remove duplicate year prefix
  const getCleanLeagueName = (league: any) => {
    if (!league) return null;
    
    let displayName = league.name;
    const yearStr = league.year.toString();
    
    // Remove year prefix if it duplicates the year
    if (displayName.startsWith(yearStr)) {
      // This pattern matches both "2013 2013" and just a single year prefix
      displayName = displayName.replace(new RegExp(`^${yearStr}\\s+${yearStr}\\s+`), '');
      displayName = displayName.replace(new RegExp(`^${yearStr}\\s+`), '');
    }
    
    return `${league.year} ${displayName}`;
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (onSelect) {
      onSelect(activity);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Idag";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Imorgon";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Igår";
    } else {
      return date.toLocaleDateString('sv-SE', { 
        weekday: isMobile ? 'short' : 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Get the color class for the result text
  const resultTextColor = getResultTextColor(activity);

  // Generate unique ID for this activity card for sharing
  const cardId = `activity-card-${activity.id}`;

  return (
    <Card 
      id={cardId}
      className="cursor-pointer hover:shadow-md transition-shadow duration-200 border-l-4 border-l-primary/20 hover:border-l-primary/40"
      onClick={handleClick}
    >
      <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-[1fr,auto]'} gap-4`}>
          {/* Main content */}
          <div className={`space-y-${isMobile ? '2' : '3'}`}>
            {/* Header with title and badges */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'} truncate`}>{activity.name}</h3>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <CupMatchBadge activity={activity} isMobile={isMobile} />
                {activity.type === 'match' && actualIsHistorical && (
                  <Badge variant="outline" className={`${isMobile ? 'text-xs px-1.5 py-0.5' : 'text-sm'}`}>
                    <Trophy className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
                    <span className={`${resultTextColor} ${isMobile ? 'text-sm' : 'text-lg'} font-bold`}>{formatResult(activity)}</span>
                  </Badge>
                )}
                {/* Share button moved to the far right with icon only */}
                {activity.type === 'match' && (
                  <ShareMatchCard 
                    targetElementId={cardId}
                    size="icon"
                    variant="ghost"
                    className={isMobile ? "h-6 w-6" : "h-8 w-8"}
                  />
                )}
              </div>
            </div>

            {/* Meta information - more compact on mobile */}
            <div className={`flex flex-wrap items-center ${isMobile ? 'gap-2' : 'gap-4'} ${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
              <div className="flex items-center gap-1">
                <Calendar className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                <span>{formatDate(activity.date)}</span>
              </div>
              
              {activity.location?.name && (
                <div className="flex items-center gap-1">
                  <MapPin className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  <span className={`truncate ${isMobile ? 'max-w-20' : ''}`}>{activity.location.name}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Users className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                <span>{participatingPlayers.length}</span>
              </div>

              {league && !isMobile && (
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  <span>{getCleanLeagueName(league)}</span>
                </div>
              )}
            </div>

            {/* Participants preview - optimized for mobile */}
            <ActivityParticipants 
              participants={participatingPlayers} 
              onPlayerSelect={onPlayerSelect}
              isMobile={isMobile}
              allActivities={allActivities}
              currentActivity={activity}
            />

            {/* Goals and assists display for historical matches */}
            {actualIsHistorical && activity.type === 'match' && (
              <GoalAssistDisplay 
                activity={activity} 
                players={players} 
                compact={isMobile}
              />
            )}

            {/* Match report summary for historical activities - more compact on mobile */}
            {actualIsHistorical && (
              <div className={isMobile ? 'text-xs' : ''}>
                <MatchReportSummary activity={activity} />
              </div>
            )}
          </div>

          {/* Stats widget - right side on desktop, integrated on mobile */}
          {!isMobile && (
            <div className="flex-shrink-0">
              <ActivityStatsWidget 
                activity={activity}
                participants={participatingPlayers}
                isHistorical={actualIsHistorical}
                isMobile={isMobile}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
