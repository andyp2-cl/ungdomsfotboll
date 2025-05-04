
import { useState, useEffect, useCallback } from "react";
import { ActivityType } from "@/types/player";

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
  [key: string]: any; // Allow for additional fields if needed
}

export interface FormStateConfig {
  initialValues?: Partial<FormStateData>;
  onTypeChange?: (type: ActivityType) => void;
  onDateChange?: (date: string) => void;
  onFieldChange?: (field: string, value: any) => void;
}

export interface FormStateActions {
  handleInputChange: (field: keyof FormStateData, value: any) => void;
  handleTypeChange: (value: ActivityType) => void;
  handleDateChange: (date: Date | undefined) => void;
  handleCupChange: (value: string) => void;
  handleLeagueChange: (value: string) => void;
  resetForm: () => void;
  setFormValues: (values: Partial<FormStateData>) => void;
}

/**
 * A reusable form state manager for activity forms
 */
export function useFormStateManager(config: FormStateConfig = {}): FormStateData & FormStateActions {
  const { initialValues = {}, onTypeChange, onDateChange, onFieldChange } = config;
  
  // Initialize form state with default values, overridden by initialValues
  const [formState, setFormState] = useState<FormStateData>({
    name: initialValues.name || "",
    date: initialValues.date || new Date(),
    type: initialValues.type || "match",
    locationName: initialValues.locationName || "",
    locationDescription: initialValues.locationDescription || "",
    locationGpsLink: initialValues.locationGpsLink || "",
    time: initialValues.time || "",
    cupName: initialValues.cupName || "no-cup",
    leagueId: initialValues.leagueId || "none",
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
      onDateChange(formState.date.toISOString().split('T')[0]);
    }
  }, [formState.date, onDateChange]);

  // Generic field change handler
  const handleInputChange = useCallback((field: keyof FormStateData, value: any) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    if (onFieldChange) {
      onFieldChange(field as string, value);
    }
  }, [onFieldChange]);

  // Type-specific handlers for common fields
  const handleTypeChange = useCallback((value: ActivityType) => {
    handleInputChange('type', value);
  }, [handleInputChange]);

  const handleDateChange = useCallback((date: Date | undefined) => {
    handleInputChange('date', date);
  }, [handleInputChange]);

  const handleCupChange = useCallback((value: string) => {
    handleInputChange('cupName', value);
  }, [handleInputChange]);

  const handleLeagueChange = useCallback((value: string) => {
    handleInputChange('leagueId', value);
  }, [handleInputChange]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormState({
      name: initialValues.name || "",
      date: initialValues.date || new Date(),
      type: initialValues.type || "match",
      locationName: initialValues.locationName || "",
      locationDescription: initialValues.locationDescription || "",
      locationGpsLink: initialValues.locationGpsLink || "",
      time: initialValues.time || "",
      cupName: initialValues.cupName || "no-cup",
      leagueId: initialValues.leagueId || "none",
    });
  }, [initialValues]);

  // Update multiple form values at once
  const setFormValues = useCallback((values: Partial<FormStateData>) => {
    setFormState(prev => ({ ...prev, ...values }));
  }, []);

  return {
    ...formState,
    handleInputChange,
    handleTypeChange,
    handleDateChange,
    handleCupChange,
    handleLeagueChange,
    resetForm,
    setFormValues
  };
}
