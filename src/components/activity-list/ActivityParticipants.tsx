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
  
  // Check if current activity is upcoming
  const currentDate = new Date();
  const activityDate = currentActivity ? new Date(currentActivity.date) : null;
  const isUpcomingActivity = activityDate && activityDate >= currentDate;
  
  console.log("ActivityParticipants: Enhanced Debug Info");
  console.log("- currentActivity:", currentActivity?.name, currentActivity?.date);
  console.log("- current date:", currentDate.toISOString());
  console.log("- activity date:", activityDate?.toISOString());
  console.log("- isUpcomingActivity:", isUpcomingActivity);
  console.log("- allActivities count:", allActivities.length);
  console.log("- participants count:", participants.length);
  
  // Visa alltid hela namnet, utan trunkering
  const getDisplayName = (fullName: string) => fullName;

  const handlePlayerClick = (playerId: string, playerName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log("ActivityParticipants: Player clicked:", playerName, "ID:", playerId);
    console.log("ActivityParticipants: onPlayerSelect available:", !!onPlayerSelect);
    
    if (onPlayerSelect) {
      console.log("ActivityParticipants: Calling onPlayerSelect");
      onPlayerSelect(playerId);
    } else {
      console.log("ActivityParticipants: No onPlayerSelect handler provided");
    }
  };

  if (!displayedParticipants.length) {
    return (
      <div className="text-xs text-muted-foreground">
        Inga deltagare
      </div>
    );
  }

  // Improved mobile sizing - fewer columns for better name visibility
  const avatarSize = isMobile ? 'h-9 w-9' : 'h-16 w-16';
  const iconSize = isMobile ? 'h-4 w-4' : 'h-8 w-8';
  const gridCols = isMobile ? 'grid-cols-4' : 'grid-cols-9'; // Reduced from 6 to 4 on mobile
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
            
            <div className={`grid ${isMobile ? 'grid-cols-4' : 'grid-cols-9'} ${isMobile ? 'gap-1' : 'gap-1'} w-full`}>
              {playersInGrade.map((player) => {
                // Räkna matcher för spelaren under samma vecka som denna aktivitet
                let weeklyMatchCount = 0;
                if (allActivities.length > 0 && currentActivity) {
                  weeklyMatchCount = getWeeklyMatchCountForActivity(player.id, allActivities, currentActivity);
                }
                // Visa badge endast för kommande matcher och om spelaren har 2+ matcher samma vecka
                const shouldShowBadge = isUpcomingActivity && weeklyMatchCount >= 2;
                
                console.log(`ActivityParticipants: Player ${player.name}: shouldShowBadge = ${shouldShowBadge} (weeklyMatchCount: ${weeklyMatchCount})`);
                
                return (
                  <div 
                    key={player.id}
                    data-player-item="true"
                    className={`flex flex-col items-center ${isMobile ? 'gap-0.5' : 'gap-0.5'} border rounded p-1 bg-background ${onPlayerSelect ? 'cursor-pointer hover:bg-accent transition-colors' : ''}`}
                    onClick={onPlayerSelect ? (e) => handlePlayerClick(player.id, player.name, e) : undefined}
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
                            {/* Weekly match count badge - show for 2+ matches, only for upcoming */}
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
                      className={`text-xs text-center w-full break-all whitespace-normal leading-tight px-0.5`}
                    >
                      {getDisplayName(player.name)}
                    </span>
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
