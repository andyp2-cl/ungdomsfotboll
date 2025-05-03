
import { Activity } from "@/types/player";

export interface MatchResultProps {
  activity: Activity;
  onSave: (homeScore?: number, awayScore?: number) => Promise<void>;
  isReadOnly?: boolean;
  resultColorClass?: string;
}

export interface ResultActionsProps {
  onSave: () => void;
  isSaving: boolean;
  isReadOnly?: boolean;
}
