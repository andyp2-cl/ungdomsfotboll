
import React from "react";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";

interface ScoreInputDisplayProps {
  homeTeamLabel: string;
  awayTeamLabel: string;
  homeScore: number | undefined;
  awayScore: number | undefined;
  handleHomeScoreChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAwayScoreChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isReadOnly?: boolean;
  isHassleholm: 'home' | 'away';
  resultColorClass?: string;
}

export function ScoreInputDisplay({
  homeTeamLabel,
  awayTeamLabel,
  homeScore,
  awayScore,
  handleHomeScoreChange,
  handleAwayScoreChange,
  isReadOnly = false,
  isHassleholm,
  resultColorClass = ""
}: ScoreInputDisplayProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="grid grid-cols-3 gap-3 items-center">
      <div className="space-y-1">
        <div className={`font-medium text-center ${isMobile ? 'text-xs' : 'text-sm'} ${isHassleholm === 'home' ? "font-semibold" : ""}`}>
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
            onChange={handleHomeScoreChange}
            className={`${isMobile ? 'h-10 text-center' : ''} ${isHassleholm === 'home' ? "border-blue-200" : ""}`}
          />
        )}
      </div>
      
      <div className="flex justify-center items-center">
        <div className="text-xl font-bold">-</div>
      </div>
      
      <div className="space-y-1">
        <div className={`font-medium text-center ${isMobile ? 'text-xs' : 'text-sm'} ${isHassleholm === 'away' ? "font-semibold" : ""}`}>
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
            onChange={handleAwayScoreChange}
            className={`${isMobile ? 'h-10 text-center' : ''} ${isHassleholm === 'away' ? "border-blue-200" : ""}`}
          />
        )}
      </div>
    </div>
  );
}
