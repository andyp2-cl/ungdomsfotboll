
// Player-related types
export type PlayerPosition = "MV" | "BACK" | "MF" | "ANF" | "TRÄNARE";

export type PlayerGrade = "A" | "B" | "C" | "D";

export interface Player {
  id: string;
  name: string;
  grade: PlayerGrade;
  positions?: PlayerPosition[];
  jerseyNumber?: string;
  image?: string;
  stats?: PlayerStats;
  activities?: string[];
}

export interface PlayerStats {
  goals: number;
  assists: number;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
}

// Activity-related types
export type ActivityType = "match" | "cup";

export interface Activity {
  id: string;
  name: string;
  type: ActivityType;
  date: string;
  time?: string;
  location?: {
    name: string;
    description?: string;
    gpsLink?: string;
  };
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
    goals: Record<string, number>;
    assists: Record<string, number>;
    scores?: {
      home: number;
      away: number;
    };
    isWin?: boolean;
  };
  league_id?: string;
  leagueName?: string;
}

// League-related types
export interface League {
  id: string;
  name: string;
  year: number;
  division: string;
  created_at: string;
}

// Form schema types
export interface ActivityFormSchema {
  name: string;
  type: ActivityType;
  date: Date;
  time?: string;
  location?: {
    name?: string;
    description?: string;
    gpsLink?: string;
  };
  homeScore?: number;
  awayScore?: number;
  cupName?: string;
  isWin?: boolean;
  league_id?: string;
}

export interface PlayerFormSchema {
  name: string;
  grade: PlayerGrade;
  positions: PlayerPosition[];
  jerseyNumber?: string;
  image?: string;
}

// Add extensions to Activity type to support form interactions
export interface ActivityFormValues extends Omit<ActivityFormSchema, "date"> {
  date: Date;
}
