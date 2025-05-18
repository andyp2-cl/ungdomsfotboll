
import React from 'react';
import { Users } from 'lucide-react';
import { Activity, Player } from '@/types/player';
import { GradePieChart } from '../activity-detail/match-result/GradePieChart';
import { getResultMessage, getResultTextColor } from './utils/result-utils';

interface ActivitySidebarProps {
  activity: Activity;
  participantPlayers: Player[];
  totalParticipants: number;
  isHistorical?: boolean;
  isMobileView?: boolean;
}

export function ActivitySidebar({
  activity,
  participantPlayers,
  totalParticipants,
  isHistorical = false,
  isMobileView = false
}: ActivitySidebarProps) {
  const resultMessage = isHistorical ? getResultMessage(activity) : '';
  const resultTextColor = getResultTextColor(activity);
  const showGradeChart = participantPlayers.length > 0;
  
  return (
    <div className="md:w-48 md:min-w-48 flex flex-col items-end justify-start">
      {resultMessage && (
        <div className={`${isMobileView ? 'text-base font-medium mb-2' : 'text-sm font-medium mb-3'} ${resultTextColor}`}>
          {resultMessage}
        </div>
      )}
      
      <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
        <Users className={`${isMobileView ? 'h-3 w-3' : 'h-4 w-4'}`} />
        <span className={isMobileView ? 'text-xs' : ''}>{totalParticipants} deltagare</span>
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
  );
}
