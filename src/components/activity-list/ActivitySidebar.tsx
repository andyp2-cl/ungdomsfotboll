
import React from "react";
import { Users } from "lucide-react";
import { Activity, Player } from "@/types/player";
import { MatchResultDisplay } from "./MatchResultDisplay";
import { GradePieChart } from "../activity-detail/match-result/GradePieChart";

interface ActivitySidebarProps {
  activity: Activity;
  participantPlayers: Player[];
  participantCount: number;
  isMobile?: boolean;
}

export function ActivitySidebar({ 
  activity, 
  participantPlayers, 
  participantCount, 
  isMobile = false 
}: ActivitySidebarProps) {
  const showGradeChart = participantPlayers.length > 0;

  return (
    <div className="md:w-48 flex flex-col items-end justify-start">
      <MatchResultDisplay activity={activity} isMobile={isMobile} />
      
      <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
        <Users className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
        <span className={isMobile ? 'text-xs' : ''}>{participantCount} deltagare</span>
      </div>

      {showGradeChart && !isMobile && (
        <div className="w-24 h-24 overflow-hidden">
          <GradePieChart 
            activity={activity} 
            participatingPlayers={participantPlayers} 
          />
        </div>
      )}
      
      {showGradeChart && isMobile && (
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
