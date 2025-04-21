export interface Player {
  id: string;
  name: string;
  grade: string;
  position?: string;
  jersey_number?: string;
  image?: string;
  activities?: string[];
  player_stats?: {
    goals?: { [activityId: string]: number };
    assists?: { [activityId: string]: number };
  };
}

export type PlayerGrade =
  | "A-lag"
  | "U19"
  | "U17"
  | "U16"
  | "U15"
  | "U14"
  | "U13"
  | "Annan";

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
  player_stats?: {
    goals?: { [playerId: string]: number };
    assists?: { [playerId: string]: number };
    scores?: {
      home?: number;
      away?: number;
    };
    isWin?: boolean;
  };
  [key: string]: any;
  league_id?: string;
  leagueName?: string;  // For UI display purposes
}

export interface League {
  id: string;
  name: string;
  year: number;
  division: string;
  created_at?: string;
}
