
import React from "react";
import { Activity, Player } from "@/types/player";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, Trophy } from "lucide-react";
import { ActivityMeta } from "./ActivityMeta";
import { ActivityParticipants } from "./ActivityParticipants";
import { CupMatchBadge } from "./CupMatchBadge";
import { MatchReportSummary } from "./MatchReportSummary";
import { formatResult, getResultTextColor } from "./utils/result-utils";

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
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Get the color class for the result text
  const resultTextColor = getResultTextColor(activity);

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow duration-200 border-l-4 border-l-primary/20"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with title and badges */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">{activity.name}</h3>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <CupMatchBadge activity={activity} />
              {activity.type === 'match' && actualIsHistorical && (
                <Badge variant="outline" className="text-xs">
                  <Trophy className="h-3 w-3 mr-1" />
                  <span className={resultTextColor}>{formatResult(activity)}</span>
                </Badge>
              )}
            </div>
          </div>

          {/* Meta information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(activity.date)}</span>
            </div>
            
            {activity.time && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{activity.time}</span>
              </div>
            )}
            
            {activity.location?.name && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{activity.location.name}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{participatingPlayers.length} deltagare</span>
            </div>
          </div>

          {/* Participants preview */}
          <ActivityParticipants 
            participants={participatingPlayers} 
            maxShow={6}
            onPlayerSelect={onPlayerSelect}
            isMobile={isMobile}
          />

          {/* Match report summary for historical activities */}
          {actualIsHistorical && (
            <MatchReportSummary activity={activity} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
