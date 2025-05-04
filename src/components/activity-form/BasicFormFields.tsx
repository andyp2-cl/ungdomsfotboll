
import React from "react";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DatePicker } from '@/components/ui/date-picker';
import { ActivityType } from "@/types/player";

interface BasicFormFieldsProps {
  name: string;
  date: Date | undefined;
  type: ActivityType;
  time: string;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTypeChange: (type: ActivityType) => void;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function BasicFormFields({
  name,
  date,
  type,
  time,
  onNameChange,
  onTypeChange,
  onDateChange,
  onTimeChange
}: BasicFormFieldsProps) {
  return (
    <>
      <div>
        <Label htmlFor="name">Namn</Label>
        <Input
          id="name"
          value={name}
          onChange={onNameChange}
        />
      </div>
      <div>
        <Label>Typ</Label>
        <RadioGroup 
          defaultValue="match" 
          className="flex gap-2" 
          onValueChange={(value) => onTypeChange(value as ActivityType)}
          value={type}
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
          onSelect={onDateChange}
        />
      </div>
      <div>
        <Label htmlFor="time">Tid</Label>
        <Input
          type="time"
          id="time"
          value={time}
          onChange={onTimeChange}
        />
      </div>
    </>
  );
}
