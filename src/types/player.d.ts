
import { Database } from './supabase';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type PlayerGrade = 'A' | 'B' | 'C' | 'D';
export type PlayerPosition = "MV" | "BACK" | "MF" | "ANF" | "TRÄNARE";

export interface Player {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  positions?: PlayerPosition[];
  grade?: PlayerGrade;
  image?: string;
  active?: boolean;
  activities?: string[];
  jerseyNumber?: string;
  [key: string]: any;
}

export interface PlayerStats {
  goals: Record<string, number>;
  assists: Record<string, number>;
  scores?: {
    home?: number;
    away?: number;
  };
  isWin?: boolean;
  cup_matches?: string[];
  [key: string]: any;
}

export interface Activity {
  id: string;
  name: string;
  date: string;
  type: "match" | "cup" | "training";
  time?: string;
  location?: {
    name: string;
    description?: string;
    gpsLink?: string;
  };
  kioskAssignedPlayerId?: string;
  scraped?: boolean;
  participants: string[];
  cupId?: string;
  cupName?: string;
  matches?: string[];
  result?: string;
  homeScore?: number;
  awayScore?: number;
  isWin?: boolean;
  player_stats?: PlayerStats;
  league_id?: string;
  leagueName?: string;
  [key: string]: any;
}

export interface CupMatch {
  id?: string;
  name: string;
  time: string;
  location?: string;
  locationDescription?: string;
}
