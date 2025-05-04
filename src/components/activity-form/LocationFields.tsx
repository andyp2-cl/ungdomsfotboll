
import React from "react";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LocationFieldsProps {
  locationName: string;
  locationDescription: string;
  locationGpsLink: string;
  onLocationNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLocationDescriptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLocationGpsLinkChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function LocationFields({
  locationName,
  locationDescription,
  locationGpsLink,
  onLocationNameChange,
  onLocationDescriptionChange,
  onLocationGpsLinkChange
}: LocationFieldsProps) {
  return (
    <>
      <div>
        <Label htmlFor="locationName">Plats</Label>
        <Input
          id="locationName"
          value={locationName}
          onChange={onLocationNameChange}
        />
      </div>
      <div>
        <Label htmlFor="locationDescription">Beskrivning av plats</Label>
        <Input
          id="locationDescription"
          value={locationDescription}
          onChange={onLocationDescriptionChange}
        />
      </div>
      <div>
        <Label htmlFor="locationGpsLink">GPS-länk</Label>
        <Input
          id="locationGpsLink"
          value={locationGpsLink}
          onChange={onLocationGpsLinkChange}
        />
      </div>
    </>
  );
}
