
import React, { useState } from "react";
import { Activity, Player, ActivityType } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivePlayerSelector } from "@/components/activity-management/ActivePlayerSelector";

interface AddActivityFormProps {
  players: Player[];
  onSave: (activity: Activity) => void;
  onCancel: () => void;
  onTypeChange?: (type: ActivityType) => void;
  onDateChange?: (date: string) => void;
}

export function AddActivityForm({ players, onSave, onCancel, onTypeChange, onDateChange }: AddActivityFormProps) {
  const [formData, setFormData] = useState<{
    name: string;
    date: string;
    time: string;
    type: ActivityType;
    location: {
      name: string;
      description: string;
      gpsLink: string;
    };
  }>({
    name: "",
    date: "",
    time: "",
    type: "training",
    location: {
      name: "",
      description: "",
      gpsLink: ""
    }
  });
  
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

  // Filter to only active players for the "select all" functionality
  const activePlayers = players.filter(player => {
    const isActive = player.isActive !== undefined ? player.isActive : true;
    return isActive;
  });

  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayerIds(prev => 
      prev.includes(playerId) 
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleSelectAll = () => {
    // Only select active players
    const activePlayerIds = activePlayers.map(p => p.id);
    setSelectedPlayerIds(activePlayerIds);
  };

  const handleSelectNone = () => {
    setSelectedPlayerIds([]);
  };

  const handleTypeChange = (newType: ActivityType) => {
    setFormData(prev => ({ ...prev, type: newType }));
    if (onTypeChange) {
      onTypeChange(newType);
    }
  };

  const handleDateChange = (newDate: string) => {
    setFormData(prev => ({ ...prev, date: newDate }));
    if (onDateChange) {
      onDateChange(newDate);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const activity: Activity = {
      id: crypto.randomUUID(),
      name: formData.name,
      date: formData.date,
      time: formData.time,
      type: formData.type,
      location: formData.location.name ? formData.location : undefined,
      participants: selectedPlayerIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    onSave(activity);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Lägg till ny aktivitet</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Aktivitetsnamn</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="type">Typ</Label>
              <Select 
                value={formData.type} 
                onValueChange={handleTypeChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="training">Träning</SelectItem>
                  <SelectItem value="match">Match</SelectItem>
                  <SelectItem value="cup">Cup</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date">Datum</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleDateChange(e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="time">Tid</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location-name">Plats</Label>
            <Input
              id="location-name"
              value={formData.location.name}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                location: { ...prev.location, name: e.target.value }
              }))}
              placeholder="T.ex. Hässleholms IP"
            />
          </div>

          <div>
            <Label htmlFor="location-description">Platsbeskrivning</Label>
            <Textarea
              id="location-description"
              value={formData.location.description}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                location: { ...prev.location, description: e.target.value }
              }))}
              placeholder="Ytterligare information om platsen..."
            />
          </div>

          <ActivePlayerSelector
            players={players}
            selectedPlayerIds={selectedPlayerIds}
            onPlayerToggle={handlePlayerToggle}
            onSelectAll={handleSelectAll}
            onSelectNone={handleSelectNone}
          />

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Avbryt
            </Button>
            <Button type="submit" disabled={!formData.name || !formData.date}>
              Spara aktivitet
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
