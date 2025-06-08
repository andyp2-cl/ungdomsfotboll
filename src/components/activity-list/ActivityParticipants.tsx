
import React from "react";
import { Player } from "@/types/player";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRound, Trophy, Target, Award } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { sortPlayersByGrade } from "@/utils/gradeUtils";
import { formatPositions, isTrainer } from "@/utils/positionUtils";

interface ActivityParticipantsProps {
  participants: Player[];
  onPlayerSelect?: (playerId: string) => void;
  totalCount?: number;
  maxDisplayed?: number;
  maxShow?: number;
  isMobile?: boolean;
  showAll?: boolean;
}

export function ActivityParticipants({
  participants,
  onPlayerSelect,
  totalCount = 0,
  maxDisplayed = 100,
  maxShow = 100,
  isMobile = false,
  showAll = true
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
  
  // Function to get first name only, but keep more characters for mobile
  const getDisplayName = (fullName: string) => {
    if (isMobile) {
      const firstName = fullName.split(' ')[0];
      return firstName.length > 6 ? firstName.substring(0, 5) + '.' : firstName;
    }
    const firstName = fullName.split(' ')[0];
    return firstName.length > 8 ? firstName.substring(0, 7) + '.' : firstName;
  };

  // Get grade color for visual enhancement
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'from-green-400 to-green-600';
      case 'B': return 'from-blue-400 to-blue-600';
      case 'C': return 'from-orange-400 to-orange-600';
      case 'D': return 'from-purple-400 to-purple-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  // Calculate basic stats for player (mock data for demonstration)
  const getPlayerStats = (player: Player) => {
    const matchCount = player.activities?.length || 0;
    const winRate = Math.floor(Math.random() * 40) + 60; // Mock win rate 60-100%
    const goals = Math.floor(Math.random() * 10); // Mock goals 0-9
    return { matchCount, winRate, goals };
  };

  const handlePlayerClick = (playerId: string, playerName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log("ActivityParticipants: Player clicked:", playerName, "ID:", playerId);
    
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

  const avatarSize = isMobile ? 'h-12 w-12' : 'h-16 w-16';
  const iconSize = isMobile ? 'h-3 w-3' : 'h-4 w-4';
  const gridCols = isMobile ? 'grid-cols-3' : 'grid-cols-6';
  const cardPadding = isMobile ? 'p-2' : 'p-3';
  const gap = isMobile ? 'gap-2' : 'gap-3';

  return (
    <div className="flex flex-col gap-3 w-full">
      {['A', 'B', 'C', 'D', 'undefined'].map(gradeKey => {
        const playersInGrade = participantsByGrade[gradeKey];
        
        if (playersInGrade.length === 0) return null;
        
        return (
          <div key={gradeKey} className="flex flex-col gap-2">
            {gradeKey !== 'undefined' && (
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={`bg-gradient-to-r ${getGradeColor(gradeKey)} text-white border-0 font-semibold ${isMobile ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1'}`}
                >
                  Nivå {gradeKey}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {playersInGrade.length} spelare
                </span>
              </div>
            )}
            
            <div className={`grid ${gridCols} ${gap} w-full`}>
              {playersInGrade.map((player) => {
                const stats = getPlayerStats(player);
                const playerIsTrainer = isTrainer(player.positions);
                
                return (
                  <div 
                    key={player.id}
                    data-player-item="true"
                    className={`relative flex flex-col items-center gap-1 border rounded-lg ${cardPadding} bg-gradient-to-br from-background to-muted/30 ${onPlayerSelect ? 'cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200' : ''} group`}
                    onClick={onPlayerSelect ? (e) => handlePlayerClick(player.id, player.name, e) : undefined}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="relative">
                            <Avatar className={`border-2 border-background ${avatarSize} shadow-sm group-hover:shadow-md transition-shadow`}>
                              <AvatarImage src={player.image} alt={player.name} />
                              <AvatarFallback className="bg-muted text-muted-foreground">
                                <UserRound className={iconSize} />
                              </AvatarFallback>
                            </Avatar>
                            
                            {/* Position badge overlay */}
                            {!playerIsTrainer && player.positions && player.positions.length > 0 && (
                              <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-1 py-0.5 rounded-full font-medium shadow-sm">
                                {formatPositions(player.positions, true).split('/')[0]}
                              </div>
                            )}
                            
                            {/* Trainer badge */}
                            {playerIsTrainer && (
                              <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs px-1 py-0.5 rounded-full font-medium shadow-sm">
                                T
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <div className="space-y-2">
                            <div className="font-medium">{player.name}</div>
                            
                            {player.grade && !playerIsTrainer && (
                              <Badge variant="outline" className={`bg-gradient-to-r ${getGradeColor(player.grade)} text-white border-0`}>
                                Nivå {player.grade}
                              </Badge>
                            )}
                            
                            {playerIsTrainer && (
                              <Badge className="bg-amber-500 text-white">Tränare</Badge>
                            )}
                            
                            {!playerIsTrainer && (
                              <>
                                {player.positions && player.positions.length > 0 && (
                                  <div className="text-sm text-muted-foreground">
                                    Positioner: {formatPositions(player.positions)}
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-3 text-sm">
                                  <div className="flex items-center gap-1">
                                    <Trophy className="h-3 w-3 text-yellow-500" />
                                    <span>{stats.winRate}%</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Target className="h-3 w-3 text-green-500" />
                                    <span>{stats.goals}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Award className="h-3 w-3 text-blue-500" />
                                    <span>{stats.matchCount}</span>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    {/* Player name */}
                    <span className={`text-xs text-center w-full font-medium ${isMobile ? 'leading-tight px-0.5' : ''} overflow-hidden text-ellipsis whitespace-nowrap group-hover:text-primary transition-colors`}>
                      {getDisplayName(player.name)}
                    </span>
                    
                    {/* Jersey number */}
                    {player.jerseyNumber && !playerIsTrainer && (
                      <span className="text-xs text-muted-foreground font-medium">
                        #{player.jerseyNumber}
                      </span>
                    )}
                    
                    {/* Quick stats for non-mobile */}
                    {!isMobile && !playerIsTrainer && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trophy className="h-3 w-3 text-yellow-500" />
                        <span>{stats.winRate}%</span>
                        <Target className="h-3 w-3 text-green-500 ml-1" />
                        <span>{stats.goals}</span>
                      </div>
                    )}
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
