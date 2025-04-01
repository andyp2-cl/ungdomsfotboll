
import React, { useState, useEffect } from "react";
import { Activity, ActivityType } from "@/types/player";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { v4 as uuidv4 } from 'uuid';
import { format } from "date-fns";

interface AddActivityFormProps {
  onSave: (activity: Activity) => void;
  onCancel: () => void;
  onTypeChange?: (type: ActivityType) => void;
  onDateChange?: (date: string) => void;
}

export function AddActivityForm({ 
  onSave, 
  onCancel, 
  onTypeChange, 
  onDateChange 
}: AddActivityFormProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [type, setType] = useState<ActivityType>("match");
  const [locationName, setLocationName] = useState("");
  const [locationDescription, setLocationDescription] = useState("");
  const [locationGpsLink, setLocationGpsLink] = useState("");
  const [time, setTime] = useState("");
  const [cupMatches, setCupMatches] = useState<string[]>([]);

  useEffect(() => {
    if (onTypeChange) {
      onTypeChange(type);
    }
  }, [type, onTypeChange]);

  useEffect(() => {
    if (date && onDateChange) {
      onDateChange(format(date, 'yyyy-MM-dd'));
    }
  }, [date, onDateChange]);

  const handleSave = () => {
    if (!name || !date) {
      alert("Namn och datum måste fyllas i.");
      return;
    }

    const newActivity: Activity = {
      id: uuidv4(),
      name: name,
      date: format(date, 'yyyy-MM-dd'),
      type: type,
      location: {
        name: locationName,
        description: locationDescription,
        gpsLink: locationGpsLink
      },
      time: time,
      matches: cupMatches,
      participants: [] // Adding the required participants property
    };

    onSave(newActivity);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Namn</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <Label>Typ</Label>
        <RadioGroup 
          defaultValue="match" 
          className="flex gap-2" 
          onValueChange={(value) => setType(value as ActivityType)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="match" id="match" />
            <Label htmlFor="match">Match</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cup" id="cup" />
            <Label htmlFor="cup">Cup</Label>
          </div>
        </RadioGroup>
      </div>
      <div>
        <Label htmlFor="date">Datum</Label>
        <DatePicker
          id="date"
          value={date}
          onSelect={setDate}
        />
      </div>
      <div>
        <Label htmlFor="time">Tid</Label>
        <Input
          type="time"
          id="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="locationName">Plats</Label>
        <Input
          id="locationName"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="locationDescription">Beskrivning av plats</Label>
        <Input
          id="locationDescription"
          value={locationDescription}
          onChange={(e) => setLocationDescription(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="locationGpsLink">GPS-länk</Label>
        <Input
          id="locationGpsLink"
          value={locationGpsLink}
          onChange={(e) => setLocationGpsLink(e.target.value)}
        />
      </div>

      <div className="flex justify-end space-x-2 mt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Avbryt
        </Button>
        <Button type="button" onClick={handleSave}>
          Spara
        </Button>
      </div>
    </div>
  );
}
