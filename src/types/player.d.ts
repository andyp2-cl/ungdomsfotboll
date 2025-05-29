export interface Player {
  id: string;
  name: string;
  email?: string;
  image?: string;
  grade?: string;
  positions?: string[];
  isAdmin?: boolean;
  isTrainer?: boolean;
  jerseyNumber?: number;
  phone?: string;
  address?: string;
  city?: string;
  zip?: string;
  country?: string;
  birthDate?: string;
  height?: number;
  weight?: number;
  foot?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  development?: DevelopmentNote[];
  isActive?: boolean; // New field for active/inactive status
}

export interface DevelopmentNote {
  date: string;
  note: string;
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  gps_link?: string;
}

export interface PlayerStats {
  [key: string]: any;
  matchesPlayed?: number;
  goals?: number;
  assists?: number;
  yellowCards?: number;
  redCards?: number;
  minutesPlayed?: number;
}

export type PlayerGrade = "A" | "B" | "C" | "D";

export interface Activity {
  id: string;
  name: string;
  date: string;
  time?: string;
  type: string;
  location?: Location;
  participants?: string[];
  kioskAssignedPlayerId?: string;
  cupId?: string;
  result?: string;
  homeScore?: number;
  awayScore?: number;
  playerStats?: PlayerStats;
  league_id?: string;
  location_name?: string;
  location_description?: string;
  location_gps_link?: string;
  is_win?: boolean;
  matchReport?: string;
  youtubeLink?: string;
}

export interface ActivityType {
  id: string;
  name: string;
}
