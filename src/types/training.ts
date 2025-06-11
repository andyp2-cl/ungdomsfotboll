export interface TrainingExercise {
  id: string;
  title: string;
  description: string;
  category: TrainingCategory;
  tags: string[];
  videoType?: VideoType;
  videoUrl?: string;
  imageUrl?: string;
  duration?: number; // minuter
  difficulty: 'Lätt' | 'Medium' | 'Svår';
  equipment: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingSession {
  id: string;
  name: string;
  description?: string;
  exercises: TrainingSessionExercise[];
  totalDuration: number;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingSessionExercise {
  exerciseId: string;
  duration: number;
  notes?: string;
  order: number;
}

export type TrainingCategory = 
  | 'Kvadrater'
  | 'Färdigheter'
  | 'Avslut'
  | 'Spelövning'
  | 'Uppvärmning'
  | 'Kondition'
  | 'Teknik'
  | 'Taktik'
  | 'Målvakt';

export type VideoType = 
  | 'youtube'
  | 'instagram'
  | 'tiktok'
  | 'vimeo'
  | 'facebook'
  | 'generic';

export const TRAINING_CATEGORIES: TrainingCategory[] = [
  'Kvadrater',
  'Färdigheter', 
  'Avslut',
  'Spelövning',
  'Uppvärmning',
  'Kondition',
  'Teknik',
  'Taktik',
  'Målvakt'
];

export const VIDEO_TYPES: { value: VideoType; label: string }[] = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'vimeo', label: 'Vimeo' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'generic', label: 'Annan video' }
];

export const DIFFICULTY_LEVELS = ['Lätt', 'Medium', 'Svår'] as const;

export interface TrainingStats {
  id: string;
  playerId: string;
  trainingDate: string;
  trainingType?: string;
  attendance: boolean;
  performanceScore?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerTrainingOverview {
  playerId: string;
  playerName: string;
  totalTrainings: number;
  totalMatches: number;
  trainingMatchRatio: number;
  averagePerformance?: number;
  lastTrainingDate?: string;
}

export interface TeamSelectionData {
  upcomingMatches: Activity[];
  playerStats: PlayerTrainingOverview[];
  conflicts: MatchConflict[];
}

export interface MatchConflict {
  playerId: string;
  playerName: string;
  conflictingMatches: Activity[];
  reason: 'same_day' | 'overbooked' | 'rest_needed';
}

export interface LeaguePriority {
  leagueId: string;
  leagueName: string;
  priority: 'A' | 'B' | 'C' | 'D';
  description: string;
}

export const LEAGUE_PRIORITIES: LeaguePriority[] = [
  { leagueId: '2013-a', leagueName: '2013 A', priority: 'A', description: 'Högsta prioritet' },
  { leagueId: '2014-a1', leagueName: '2014 A1', priority: 'A', description: 'Högsta prioritet' },
  { leagueId: '2014-a2', leagueName: '2014 A2', priority: 'B', description: 'Hög prioritet' },
  { leagueId: '2014-b1', leagueName: '2014 B1', priority: 'C', description: 'Medium prioritet för C,D spelare' }
];
