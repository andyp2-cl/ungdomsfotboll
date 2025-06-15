
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
    if (displayName.startsWith(yearStr)) {
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
      <CardContent className="p-3 sm:p-3">
        <div className={`flex flex-col sm:grid sm:grid-cols-[1fr,120px] gap-2 sm:gap-3`}>
          {/* Main content */}
          <div className="space-y-2 sm:space-y-3">
            {/* Kompakt header med datum/tid/plats på en rad */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base whitespace-normal">
                  {activity.name}
                </h3>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(activity.date)}
                  </span>
                  {activity.time && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {activity.time}
                    </span>
                  )}
                  {activity.location?.name && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {activity.location.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <Users className="h-3 w-3" />
                    {participatingPlayers.length}
                  </span>
                  {league && (
                    <span className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      {getCleanLeagueName(league)}
                    </span>
                  )}
                </div>
              </div>
              {/* Badge/result & share i högerhörn */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <div className="flex items-center gap-1">
                  <CupMatchBadge activity={activity} isMobile={isMobile} />
                  {activity.type === 'match' && actualIsHistorical && (
                    <Badge variant="outline" className="text-sm px-1.5 py-0.5 whitespace-nowrap">
                      <Trophy className="h-3 w-3 mr-1" />
                      <span className={`${resultTextColor} text-base font-bold`}>{formatResult(activity)}</span>
                    </Badge>
                  )}
                  {activity.type === 'match' && (
                    <ShareMatchCard 
                      targetElementId={cardId}
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Deltagar-grid - optimerad på bredden */}
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

          {/* Stats widget - höger, kompakt och smal */}
          {!isMobile && (
            <div className="flex-shrink-0 min-w-0 flex flex-col items-end">
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

// Filen ActivityListItem.tsx är nu över 230 rader lång. Efter du godkänt dessa förbättringar, rekommenderar jag att vi bryter ut header och meta till egna små komponenter för bättre översikt och hanterbarhet!
