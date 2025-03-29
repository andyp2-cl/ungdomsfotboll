import React, { useState, useEffect } from "react";
import { Activity, ActivityType } from "@/types/player";
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { v4 as uuidv4 } from 'uuid';
import { CupMatchesForm } from "@/components/CupMatchesForm";
import { format } from "date-fns";

interface AddActivityFormProps {
  onSave: (activity: Activity) => void;
  onCancel: () => void;
}

export function AddActivityForm({ onSave, onCancel }: AddActivityFormProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [type, setType] = useState<ActivityType>("match");
  const [locationName, setLocationName] = useState("");
  const [locationDescription, setLocationDescription] = useState("");
  const [locationGpsLink, setLocationGpsLink] = useState("");
  const [time, setTime] = useState("");
  const [isCup, setIsCup] = useState(false);
  const [cupMatches, setCupMatches] = useState<string[]>([]);

  useEffect(() => {
    setIsCup(type === "cup");
  }, [type]);

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
      matches: cupMatches
    };

    onSave(newActivity);
  };

  return (
    <Form>
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
          <RadioGroup defaultValue="match" className="flex gap-2" onValueChange={(value) => setType(value as ActivityType)}>
            <RadioGroupItem value="match" id="match" />
            <Label htmlFor="match">Match</Label>
            <RadioGroupItem value="cup" id="cup" />
            <Label htmlFor="cup">Cup</Label>
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

        {isCup && (
          <CupMatchesForm 
            matches={cupMatches}
            onMatchesChange={setCupMatches}
          />
        )}
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Avbryt
        </Button>
        <Button type="button" onClick={handleSave}>
          Spara
        </Button>
      </div>
    </Form>
  );
}
