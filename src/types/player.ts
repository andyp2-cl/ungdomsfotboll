
export type PlayerGrade = 'A' | 'B' | 'C' | 'D';

export type PlayerPosition = 'MV' | 'BACK' | 'MF' | 'ANF' | 'TRÄNARE';

export type ActivityType = 'match' | 'cup';

export interface PlayerStats {
  goals?: Record<string, number>; // Record of player ID to number of goals
  assists?: Record<string, number>; // Record of player ID to number of assists
}

export interface Activity {
  id: string;
  name: string;
  date: string;
  type: ActivityType;
  participants?: string[]; // Array of player IDs who are participating
  kioskAssignedPlayerId?: string; // Directly assign a player to kiosk duty (no schedule needed)
  scraped?: boolean; // Optional flag to mark if this was imported via scraper
  location?: {
    name: string;
    description?: string;
    gpsLink?: string;
  };
  time?: string; // Time of the activity, e.g. "09:30"
  cupId?: string; // Reference to the parent cup activity (for matches that are part of a cup)
  matches?: string[]; // Array of activity IDs that are matches within this cup (for cup type activities)
  playerStats?: PlayerStats; // Statistics for players in this activity
  result?: string; // Match result, e.g. "2-1"
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
