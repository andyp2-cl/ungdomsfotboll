
import React from "react";
import { Activity, Player } from "@/types/player";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, Trophy, Award, Star } from "lucide-react";
import { ActivityMeta } from "./ActivityMeta";
import { ActivityParticipants } from "./ActivityParticipants";
import { CupMatchBadge } from "./CupMatchBadge";
import { MatchReportSummary } from "./MatchReportSummary";
import { ActivityStatsWidget } from "./components/ActivityStatsWidget";
import { GoalAssistDisplay } from "./components/GoalAssistDisplay";
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
}

export function ActivityListItem({ 
  activity, 
  players, 
  onClick, 
  onSelect,
  onPlayerSelect,
  isHistorical = false,
  isMobile = false
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

  // Get activity type gradient
  const getActivityTypeGradient = (type: string) => {
    switch (type) {
      case 'match': return 'from-blue-50 to-blue-100/50';
      case 'training': return 'from-green-50 to-green-100/50';
      case 'cup': return 'from-yellow-50 to-yellow-100/50';
      default: return 'from-gray-50 to-gray-100/50';
    }
  };

  // Get the color class for the result text
  const resultTextColor = getResultTextColor(activity);

  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 ${
        activity.type === 'match' ? 'border-l-blue-400 hover:border-l-blue-500' :
        activity.type === 'training' ? 'border-l-green-400 hover:border-l-green-500' :
        activity.type === 'cup' ? 'border-l-yellow-400 hover:border-l-yellow-500' :
        'border-l-gray-400 hover:border-l-gray-500'
      } hover:scale-[1.02] group overflow-hidden`}
      onClick={handleClick}
    >
      {/* Gradient background overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getActivityTypeGradient(activity.type)} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      <CardContent className={`relative ${isMobile ? 'p-3' : 'p-4'}`}>
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-[1fr,auto]'} gap-4`}>
          {/* Main content */}
          <div className={`space-y-${isMobile ? '3' : '4'}`}>
            {/* Header with title and badges */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold ${isMobile ? 'text-sm' : 'text-lg'} truncate group-hover:text-primary transition-colors flex items-center gap-2`}>
                  {activity.type === 'match' && <Trophy className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-blue-500`} />}
                  {activity.type === 'training' && <Star className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-green-500`} />}
                  {activity.type === 'cup' && <Award className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-yellow-500`} />}
                  {activity.name}
                </h3>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <CupMatchBadge activity={activity} isMobile={isMobile} />
                {activity.type === 'match' && actualIsHistorical && (
                  <Badge 
                    variant="outline" 
                    className={`${isMobile ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1'} bg-gradient-to-r from-primary/10 to-primary/20 border-primary/30 font-bold shadow-sm`}
                  >
                    <Trophy className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
                    <span className={`${resultTextColor} ${isMobile ? 'text-sm' : 'text-lg'} font-bold`}>{formatResult(activity)}</span>
                  </Badge>
                )}
              </div>
            </div>

            {/* Enhanced meta information */}
            <div className={`flex flex-wrap items-center ${isMobile ? 'gap-3' : 'gap-4'} ${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
              <div className="flex items-center gap-1.5 bg-muted/50 rounded-full px-2 py-1">
                <Calendar className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-blue-500`} />
                <span className="font-medium">{formatDate(activity.date)}</span>
              </div>
              
              {activity.location?.name && (
                <div className="flex items-center gap-1.5 bg-muted/50 rounded-full px-2 py-1">
                  <MapPin className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-red-500`} />
                  <span className={`truncate font-medium ${isMobile ? 'max-w-20' : ''}`}>{activity.location.name}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1.5 bg-muted/50 rounded-full px-2 py-1">
                <Users className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-green-500`} />
                <span className="font-medium">{participatingPlayers.length} spelare</span>
              </div>

              {league && !isMobile && (
                <div className="flex items-center gap-1.5 bg-muted/50 rounded-full px-2 py-1">
                  <Award className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">{getCleanLeagueName(league)}</span>
                </div>
              )}
            </div>

            {/* Enhanced participants section */}
            <div className="bg-muted/20 rounded-lg p-3 border border-muted/40">
              <ActivityParticipants 
                participants={participatingPlayers} 
                onPlayerSelect={onPlayerSelect}
                isMobile={isMobile}
              />
            </div>

            {/* Goals and assists display for historical matches */}
            {actualIsHistorical && activity.type === 'match' && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border border-green-200/50">
                <GoalAssistDisplay 
                  activity={activity} 
                  players={players} 
                  compact={isMobile}
                />
              </div>
            )}

            {/* Match report summary for historical activities */}
            {actualIsHistorical && (
              <div className={`${isMobile ? 'text-xs' : ''} bg-amber-50/50 rounded-lg p-3 border border-amber-200/50`}>
                <MatchReportSummary activity={activity} />
              </div>
            )}
          </div>

          {/* Stats widget - right side on desktop */}
          {!isMobile && (
            <div className="flex-shrink-0 min-w-0">
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
