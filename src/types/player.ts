
export type PlayerGrade = 'A' | 'B' | 'C' | 'D';

export type PlayerPosition = 'MV' | 'BACK' | 'MF' | 'ANF' | 'TRÄNARE';

export type ActivityType = 'match' | 'cup';

export interface PlayerStats {
  goals?: Record<string, number>; // Record of player ID to number of goals
  assists?: Record<string, number>; // Record of player ID to number of assists
  scores?: {
    home?: number;
    away?: number;
  }; // Score information for matches
  isWin?: boolean; // Whether the match was a win for Hässleholms IF
}

export interface Location {
  name: string;
  description?: string;
  gpsLink?: string;
}

export interface Activity {
  id: string;
  name: string;
  date: string;
  type: ActivityType;
  time?: string;
  location?: Location;
  participants: string[]; // Player IDs
  kioskAssignedPlayerId?: string;
  scraped?: boolean;
  cupId?: string;
  matches?: string[]; // Activity IDs for cup matches
  player_stats?: PlayerStats;
  result?: string; // Match result, e.g. "2-1"
  homeScore?: number; // Home team's score
  awayScore?: number; // Away team's score
  isWin?: boolean; // Whether the match was a win for Hässleholms IF
}

export interface Player {
  id: string;
  name: string;
  grade: PlayerGrade;
  positions?: PlayerPosition[]; // Changed from position to positions array
  activities?: string[]; // Array of activity IDs this player is participating in
  jerseyNumber?: string; // Optional jersey number for the player
  image?: string; // URL to player's image
}
