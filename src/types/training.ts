
export interface TrainingExercise {
  id: string;
  title: string;
  description: string;
  category: TrainingCategory;
  tags: string[];
  youtubeUrl?: string;
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

export const DIFFICULTY_LEVELS = ['Lätt', 'Medium', 'Svår'] as const;
