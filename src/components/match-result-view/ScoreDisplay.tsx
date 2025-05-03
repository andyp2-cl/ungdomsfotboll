
import React from "react";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { TeamInfo } from "./types";

interface ScoreDisplayProps {
  homeScore: number | undefined;
  awayScore: number | undefined;
  setHomeScore?: (score: number | undefined) => void;
  setAwayScore?: (score: number | undefined) => void;
  teamInfo: TeamInfo;
  isReadOnly: boolean;
  resultColorClass?: string;
  hasError?: boolean;
}

export function ScoreDisplay({
  homeScore,
  awayScore,
  setHomeScore,
  setAwayScore,
  teamInfo,
  isReadOnly,
  resultColorClass = "",
  hasError = false
}: ScoreDisplayProps) {
  const isMobile = useIsMobile();
  const { homeTeamLabel, awayTeamLabel, hassleTeamSide } = teamInfo;
  
  return (
    <div className="grid grid-cols-3 gap-3 items-center">
      <div className="space-y-1">
        <div className={`font-medium text-center ${isMobile ? 'text-xs' : 'text-sm'} ${hassleTeamSide === 'home' ? "font-semibold" : ""}`}>
          {homeTeamLabel}
        </div>
        {isReadOnly ? (
          <div className={`text-center text-lg font-bold ${resultColorClass}`}>
            {homeScore !== undefined ? homeScore : "-"}
          </div>
        ) : (
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            value={homeScore === undefined ? "" : homeScore}
            onChange={(e) => setHomeScore && setHomeScore(e.target.value === "" ? undefined : Number(e.target.value))}
            className={`${isMobile ? 'h-10 text-center' : ''} ${hassleTeamSide === 'home' ? "border-blue-200" : ""} ${hasError ? "border-red-500" : ""}`}
          />
        )}
      </div>
      
      <div className="flex justify-center items-center">
        <div className="text-xl font-bold">-</div>
      </div>
      
      <div className="space-y-1">
        <div className={`font-medium text-center ${isMobile ? 'text-xs' : 'text-sm'} ${hassleTeamSide === 'away' ? "font-semibold" : ""}`}>
          {awayTeamLabel}
        </div>
        {isReadOnly ? (
          <div className={`text-center text-lg font-bold ${resultColorClass}`}>
            {awayScore !== undefined ? awayScore : "-"}
          </div>
        ) : (
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            value={awayScore === undefined ? "" : awayScore}
            onChange={(e) => setAwayScore && setAwayScore(e.target.value === "" ? undefined : Number(e.target.value))}
            className={`${isMobile ? 'h-10 text-center' : ''} ${hassleTeamSide === 'away' ? "border-blue-200" : ""} ${hasError ? "border-red-500" : ""}`}
          />
        )}
      </div>
    </div>
  );
}
