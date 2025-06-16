import React from "react";
import { Player } from "@/types/player";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRound } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { sortPlayersByGrade } from "@/utils/gradeUtils";
import { getWeeklyMatchCountForActivity } from "@/utils/weeklyMatchUtils";

interface ActivityParticipantsProps {
  participants: Player[];
  onPlayerSelect?: (playerId: string) => void;
  totalCount?: number;
  maxDisplayed?: number;
  maxShow?: number;
  isMobile?: boolean;
  showAll?: boolean;
  allActivities?: any[]; // For calculating weekly match counts
  currentActivity?: any; // Current activity to determine if it's upcoming
}

export function ActivityParticipants({
  participants,
  onPlayerSelect,
  totalCount = 0,
  maxDisplayed = 100,
  maxShow = 100,
  isMobile = false,
  showAll = true,
  allActivities = [],
  currentActivity
}: ActivityParticipantsProps) {
  const sortedParticipants = sortPlayersByGrade(participants);
  const displayedParticipants = sortedParticipants;

  const participantsByGrade: Record<string, Player[]> = {};

  ['A', 'B', 'C', 'D', undefined].forEach(grade => {
    participantsByGrade[grade || 'undefined'] = [];
  });

  displayedParticipants.forEach(player => {
    const grade = player.grade || 'undefined';
    participantsByGrade[grade].push(player);
  });

  const currentDate = new Date();
  const activityDate = currentActivity ? new Date(currentActivity.date) : null;
  const isUpcomingActivity = activityDate && activityDate >= currentDate;

  const getDisplayName = (fullName: string) => {
    const [firstName, ...rest] = fullName.trim().split(' ');
    const lastName = rest.join(' ');
    if (!lastName) return firstName; // Om bara ett namn
    return `${firstName}<br />${lastName}`;
  };

  const handlePlayerClick = (playerId: string, playerName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onPlayerSelect) {
      onPlayerSelect(playerId);
    }
  };

  if (!displayedParticipants.length) {
    return (
      <div className="text-xs text-muted-foreground">
        Inga deltagare
      </div>
    );
  }

  // Mobile list view - compact and efficient
  if (isMobile) {
    return (
      <div className="flex flex-col gap-2 w-full">
        {['A', 'B', 'C', 'D', 'undefined'].map(gradeKey => {
          const playersInGrade = participantsByGrade[gradeKey];

          if (playersInGrade.length === 0) return null;

          return (
            <div key={gradeKey} className="flex flex-col gap-1">
              {gradeKey !== 'undefined' && (
                <Badge variant="outline" className="self-start text-xs px-1.5 py-0.5">
                  {gradeKey}
                </Badge>
              )}

              <div className="space-y-1">
                {playersInGrade.map((player) => {
                  let weeklyMatchCount = 0;
                  if (allActivities.length > 0 && currentActivity) {
                    weeklyMatchCount = getWeeklyMatchCountForActivity(player.id, allActivities, currentActivity);
                  }
                  const shouldShowBadge = isUpcomingActivity && weeklyMatchCount >= 2;

                  return (
                    <div 
                      key={player.id}
                      data-player-item="true"
                      className={`flex items-center gap-2 p-2 border rounded bg-background ${onPlayerSelect ? 'cursor-pointer hover:bg-accent transition-colors' : ''}`}
                      onClick={onPlayerSelect ? (e) => handlePlayerClick(player.id, player.name, e) : undefined}
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-8 w-8 border">
                          <AvatarImage src={player.image} alt={player.name} />
                          <AvatarFallback className="bg-muted">
                            <UserRound className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        {shouldShowBadge && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center border border-white shadow-sm z-20">
                            {weeklyMatchCount}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate block">
                          {player.name}
                        </span>
                        {shouldShowBadge && (
                          <span className="text-xs text-red-600 font-semibold">
                            {weeklyMatchCount} matcher denna vecka
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Sizing, grid & layout vars
  const avatarSize = isMobile ? 'h-9 w-9' : 'h-16 w-16';
  const iconSize = isMobile ? 'h-4 w-4' : 'h-8 w-8';
  const gridCols = isMobile ? 'grid-cols-4' : 'grid-cols-9';
  const cardPadding = isMobile ? 'p-1' : 'p-1';
  const gap = isMobile ? 'gap-1' : 'gap-1';

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {['A', 'B', 'C', 'D', 'undefined'].map(gradeKey => {
        const playersInGrade = participantsByGrade[gradeKey];

        if (playersInGrade.length === 0) return null;

        return (
          <div key={gradeKey} className="flex flex-col gap-1">
            {gradeKey !== 'undefined' && (
              <Badge variant="outline" className={`self-start mr-1 ${isMobile ? 'mb-0.5 text-xs px-1.5 py-0.5' : 'mb-1'}`}>
                {gradeKey}
              </Badge>
            )}

            <div className={`grid ${gridCols} ${gap} w-full`}>
              {playersInGrade.map((player) => {
                let weeklyMatchCount = 0;
                if (allActivities.length > 0 && currentActivity) {
                  weeklyMatchCount = getWeeklyMatchCountForActivity(player.id, allActivities, currentActivity);
                }
                const shouldShowBadge = isUpcomingActivity && weeklyMatchCount >= 2;

                return (
                  <div 
                    key={player.id}
                    data-player-item="true"
                    className={`flex flex-col items-center ${isMobile ? 'gap-0.5' : 'gap-0.5'} border rounded p-1 bg-background ${onPlayerSelect ? 'cursor-pointer hover:bg-accent transition-colors' : ''}`}
                    onClick={onPlayerSelect ? (e) => handlePlayerClick(player.id, player.name, e) : undefined}
                    style={{ minWidth: 0, width: "100%" }}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="relative">
                            <Avatar className={`border border-background ${avatarSize}`}>
                              <AvatarImage src={player.image} alt={player.name} />
                              <AvatarFallback className="bg-muted">
                                <UserRound className={iconSize} />
                              </AvatarFallback>
                            </Avatar>
                            {shouldShowBadge && (
                              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white shadow-lg z-20">
                                {weeklyMatchCount}
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div>
                            <p>{player.name}</p>
                            {player.grade && (
                              <Badge variant="outline" className="mt-1">{player.grade}</Badge>
                            )}
                            {shouldShowBadge && (
                              <p className="text-xs mt-1 text-red-600 font-semibold">{weeklyMatchCount} matcher denna vecka</p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span
                      className={
                        `block text-center w-full mx-auto mt-1 font-medium text-xs ${isMobile ? 'max-w-[84px]' : 'max-w-[120px]'}`
                      }
                      style={{
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        textWrap: "pretty",
                        padding: "0 2px",
                        lineHeight: "1.15",
                        minHeight: isMobile ? "28px" : "32px",
                        maxHeight: isMobile ? "32px" : "38px",
                        display: "block",
                      }}
                      dangerouslySetInnerHTML={{ __html: getDisplayName(player.name) }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
