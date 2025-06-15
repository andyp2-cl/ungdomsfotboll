
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
  allActivities?: any[];
  currentActivity?: any;
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
    if (!lastName) return firstName;
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
      <div className="text-xs text-muted-foreground">Inga deltagare</div>
    );
  }

  // OPTIMERAD grid: fler kolumner, mindre gap, mindre avatars
  const avatarSize = isMobile ? 'h-7 w-7' : 'h-11 w-11';
  const iconSize = isMobile ? 'h-3 w-3' : 'h-7 w-7';
  // Fler kolumner på desktop (8), på mobil (5)
  const gridCols = isMobile ? 'grid-cols-5' : 'grid-cols-8';
  const cardPadding = 'p-0.5';
  const gap = isMobile ? 'gap-[2px]' : 'gap-2';

  return (
    <div className="flex flex-col gap-1 w-full">
      {['A', 'B', 'C', 'D', 'undefined'].map(gradeKey => {
        const playersInGrade = participantsByGrade[gradeKey];
        if (playersInGrade.length === 0) return null;
        return (
          <div key={gradeKey} className="flex flex-col gap-0.5">
            {gradeKey !== 'undefined' && (
              <Badge variant="outline" className={`self-start mr-1 mb-0.5 text-xs px-1.5 py-0.5`}>
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
                    className={`flex flex-col items-center border rounded ${cardPadding} bg-background ${onPlayerSelect ? 'cursor-pointer hover:bg-accent transition-colors' : ''}`}
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
                              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-lg z-20">
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
                        `block text-center w-full mx-auto mt-0.5 font-medium text-[11px] max-w-[84px]`
                      }
                      style={{
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        textWrap: "pretty",
                        padding: "0 1px",
                        lineHeight: "1.10",
                        minHeight: isMobile ? "18px" : "22px",
                        maxHeight: isMobile ? "22px" : "28px",
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
