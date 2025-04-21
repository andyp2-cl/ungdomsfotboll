
export interface Player {
  id: string;
  name: string;
  grade?: PlayerGrade;
  position?: string[];
  jersey_number?: string;
  image?: string;
  activities?: string[];
  player_stats?: {
    goals?: { [activityId: string]: number };
    assists?: { [activityId: string]: number };
  };
}

export type PlayerGrade =
  | "A"
  | "B"
  | "C"
  | "D";

export type PlayerPosition =
  | "MV"
  | "BACK"
  | "MF"
  | "ANF"
  | "TRÄNARE";

export type ActivityType = "match" | "cup";

export interface Location {
  name: string;
  description?: string;
  gpsLink?: string;
}

export interface Activity {
  id: string;
  name: string;
  date: string;
  time?: string;
  type: ActivityType;
  location?: Location;
  participants?: string[];
  kioskAssignedPlayerId?: string;
  scraped?: boolean;
  cupId?: string;
  cupName?: string;
  matches?: string[];
  homeScore?: number;
  awayScore?: number;
  result?: string;
  isWin?: boolean;
  player_stats?: PlayerStats;
  [key: string]: any;
  league_id?: string;
  leagueName?: string;  // For UI display purposes
}

export interface PlayerStats {
  goals: Record<string, number>;
  assists: Record<string, number>;
  scores?: {
    home?: number;
    away?: number;
  };
  isWin?: boolean;
  cup_matches?: string[]; // This property is used for storing cup match IDs
  [key: string]: any; // Adding index signature for Json compatibility
}

export interface League {
  id: string;
  name: string;
  year: number;
  division: string;
  created_at?: string;
}
