
import { useState, useEffect } from "react";
import { ActivityType } from "@/types/player";
import { format } from "date-fns";

export interface FormStateData {
  name: string;
  date: Date | undefined;
  type: ActivityType;
  locationName: string;
  locationDescription: string;
  locationGpsLink: string;
  time: string;
  cupName: string;
  leagueId: string;
}

export interface FormStateActions {
  handleInputChange: (field: keyof FormStateData, value: any) => void;
  handleTypeChange: (value: ActivityType) => void;
  handleDateChange: (date: Date | undefined) => void;
  handleCupChange: (value: string) => void;
  handleLeagueChange: (value: string) => void;
}

interface UseFormStateProps {
  onTypeChange?: (type: ActivityType) => void;
  onDateChange?: (date: string) => void;
}

/**
 * Manages the form state for adding a new activity
 */
export function useFormState({ onTypeChange, onDateChange }: UseFormStateProps): FormStateData & FormStateActions {
  const [formState, setFormState] = useState<FormStateData>({
    name: "",
    date: new Date(),
    type: "match",
    locationName: "",
    locationDescription: "",
    locationGpsLink: "",
    time: "",
    cupName: "no-cup",
    leagueId: "none",
  });

  // Notify parent components when type changes
  useEffect(() => {
    if (onTypeChange) {
      onTypeChange(formState.type);
    }
  }, [formState.type, onTypeChange]);

  // Notify parent components when date changes
  useEffect(() => {
    if (formState.date && onDateChange) {
      onDateChange(format(formState.date, 'yyyy-MM-dd'));
    }
  }, [formState.date, onDateChange]);

  // Field change handlers
  const handleInputChange = (field: keyof FormStateData, value: any) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleTypeChange = (value: ActivityType) => {
    setFormState(prev => ({ ...prev, type: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setFormState(prev => ({ ...prev, date }));
  };

  const handleCupChange = (value: string) => {
    setFormState(prev => ({ ...prev, cupName: value }));
  };

  const handleLeagueChange = (value: string) => {
    setFormState(prev => ({ ...prev, leagueId: value }));
  };

  return {
    ...formState,
    handleInputChange,
    handleTypeChange,
    handleDateChange,
    handleCupChange,
    handleLeagueChange
  };
}
