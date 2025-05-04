
import React from "react";
import { Activity } from "@/types/player";
import { useAddActivityForm } from "./activity-form/hooks/useAddActivityForm";
import { BasicFormFields } from "./activity-form/BasicFormFields";
import { CupSelector } from "./activity-form/CupSelector";
import { LeagueSelector } from "./activity-form/LeagueSelector";
import { LocationFields } from "./activity-form/LocationFields";
import { FormButtons } from "./activity-form/FormButtons";

interface AddActivityFormProps {
  onSave: (activity: Activity) => void;
  onCancel: () => void;
  onTypeChange?: (type: import("@/types/player").ActivityType) => void;
  onDateChange?: (date: string) => void;
}

export function AddActivityForm({ 
  onSave, 
  onCancel, 
  onTypeChange, 
  onDateChange 
}: AddActivityFormProps) {
  const { 
    formState,
    cupNames,
    leagues,
    activitiesLoading,
    leaguesLoading,
    handleInputChange,
    handleTypeChange,
    handleDateChange,
    handleCupChange,
    handleLeagueChange,
    handleSave,
    isSaving
  } = useAddActivityForm({ onSave, onTypeChange, onDateChange });

  return (
    <div className="space-y-4">
      <BasicFormFields 
        name={formState.name}
        date={formState.date}
        type={formState.type}
        time={formState.time}
        onNameChange={(e) => handleInputChange('name', e.target.value)}
        onTypeChange={handleTypeChange}
        onDateChange={handleDateChange}
        onTimeChange={(e) => handleInputChange('time', e.target.value)}
      />
      
      {/* Cup name field for match type */}
      {formState.type === "match" && (
        <CupSelector
          cupName={formState.cupName}
          cupNames={cupNames}
          isLoading={activitiesLoading}
          onChange={handleCupChange}
        />
      )}
      
      {/* League field for match type */}
      {formState.type === "match" && (
        <LeagueSelector 
          leagueId={formState.leagueId}
          leagues={leagues}
          isLoading={leaguesLoading}
          onChange={handleLeagueChange}
        />
      )}
      
      <LocationFields
        locationName={formState.locationName}
        locationDescription={formState.locationDescription}
        locationGpsLink={formState.locationGpsLink}
        onLocationNameChange={(e) => handleInputChange('locationName', e.target.value)}
        onLocationDescriptionChange={(e) => handleInputChange('locationDescription', e.target.value)}
        onLocationGpsLinkChange={(e) => handleInputChange('locationGpsLink', e.target.value)}
      />

      <FormButtons 
        onCancel={onCancel}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
}
