
import { Activity } from "@/types/player";

export interface MatchResultProps {
  activity: Activity;
  onSave: (homeScore?: number, awayScore?: number, isWin?: boolean) => Promise<void>;
  isReadOnly?: boolean;
  resultColorClass?: string;
}

export interface TeamInfo {
  homeTeam: string;
  awayTeam: string;
  homeTeamLabel: string;
  awayTeamLabel: string;
  isHome: boolean;
  hassleTeamSide: 'home' | 'away';
  isHassleHomeName: boolean;
  isHassleAwayName: boolean;
}
