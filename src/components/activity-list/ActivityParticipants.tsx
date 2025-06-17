import React from "react";
import { Player } from "@/types/player";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRound } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { sortPlayersByGrade } from "@/utils/gradeUtils";
import { getWeeklyMatchCountForActivity } from "@/utils/weeklyMatchUtils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

  // För mobil: visa endast avatarer (utan namn), max 5 synliga, sedan '+X fler' som öppnar modal med hela listan (med namn). Namn visas i popover vid klick på avatar.
  const maxMobileAvatars = 5;
  const showMoreMobile = isMobile && participants.length > maxMobileAvatars;
  const visibleMobileParticipants = isMobile && showMoreMobile ? participants.slice(0, maxMobileAvatars) : participants;
  const moreMobileCount = isMobile && showMoreMobile ? participants.length - maxMobileAvatars : 0;
  const [open, setOpen] = React.useState(false);
  const [popoverPlayer, setPopoverPlayer] = React.useState<null | typeof participants[0]>(null);

  if (!displayedParticipants.length) {
    return (
      <div className="text-xs text-muted-foreground">
        Inga deltagare
      </div>
    );
  }

  // Sizing, grid & layout vars
  const avatarSize = isMobile ? 'h-8 w-8' : 'h-16 w-16';
  const gridCols = isMobile ? 'grid-cols-4' : 'grid-cols-9';
  const gap = isMobile ? 'gap-1' : 'gap-1';

  // MOBIL: Endast avatarer, namn i popover vid klick
  if (isMobile) {
    return (
      <div className="flex flex-row gap-1 w-full overflow-x-auto pb-1">
        {visibleMobileParticipants.map((player) => (
          <Popover key={player.id} open={popoverPlayer?.id === player.id} onOpenChange={(open) => setPopoverPlayer(open ? player : null)}>
            <PopoverTrigger asChild>
              <div className={`flex items-center justify-center ${avatarSize} rounded-full border border-background bg-background cursor-pointer`}>
                <Avatar className={`${avatarSize}`} >
                  <AvatarImage src={player.image} alt={player.name} />
                  <AvatarFallback>{player.name?.[0]}</AvatarFallback>
                </Avatar>
              </div>
            </PopoverTrigger>
            <PopoverContent align="center" className="p-2 flex flex-col items-center min-w-[120px]">
              <Avatar className="h-12 w-12 mb-2">
                <AvatarImage src={player.image} alt={player.name} />
                <AvatarFallback>{player.name?.[0]}</AvatarFallback>
              </Avatar>
              <span className="font-semibold text-center text-sm mb-1">{player.name}</span>
              {player.grade && <Badge variant="outline">{player.grade}</Badge>}
              {/* Här kan du lägga till fler spelarstats/info */}
            </PopoverContent>
          </Popover>
        ))}
        {showMoreMobile && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <div className="flex flex-col items-center justify-center min-w-[40px] h-full cursor-pointer bg-accent rounded p-1 text-xs font-semibold text-blue-700 border border-blue-200">
                +{moreMobileCount} fler
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-xs w-full p-4">
              <div className="text-center font-bold mb-2">Alla deltagare</div>
              <div className="flex flex-wrap gap-2 justify-center">
                {participants.map((player) => (
                  <div key={player.id} className="flex flex-col items-center gap-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={player.image} alt={player.name} />
                      <AvatarFallback>{player.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-center max-w-[60px] truncate">{player.name}</span>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  // DESKTOP: group by grade
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {['A', 'B', 'C', 'D', 'undefined'].map(gradeKey => {
        const playersInGrade = participantsByGrade[gradeKey];
        if (playersInGrade.length === 0) return null;
        return (
          <div key={gradeKey} className="flex flex-col gap-1">
            {gradeKey !== 'undefined' && (
              <Badge variant="outline" className={`self-start mr-1 mb-1`}>
                {gradeKey}
              </Badge>
            )}
            <div className={`grid ${gridCols} ${gap} w-full`}>
              {playersInGrade.map((player) => {
                let weeklyMatchCount = 0;
                if (allActivities.length > 0 && currentActivity) {
                  weeklyMatchCount = getWeeklyMatchCountForActivity(player.id, allActivities, currentActivity);
                }
                const shouldShowBadge = false; // Only show on mobile if needed
                return (
                  <div key={player.id} className="flex flex-col items-center border rounded p-1 bg-background">
                    <Avatar className={`border border-background ${avatarSize}`}>
                      <AvatarImage src={player.image} alt={player.name} />
                      <AvatarFallback>{player.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="block text-center w-full mx-auto mt-1 font-medium text-xs max-w-[120px]" style={{ whiteSpace: "normal", wordBreak: "break-word", textWrap: "pretty", padding: "0 2px", lineHeight: "1.15", minHeight: "32px", maxHeight: "38px", display: "block" }} dangerouslySetInnerHTML={{ __html: getDisplayName(player.name) }} />
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
