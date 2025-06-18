import React, { useState, useEffect } from "react";
import { Activity, Player, ActivityType } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
    homeTeam: string;
    awayTeam: string;
    location: {
      name: string;
      description: string;
      gpsLink: string;
    };
  }>({
    name: "",
    date: "",
    time: "",
    type: "match",
    homeTeam: "",
    awayTeam: "",
    location: {
      name: "",
      description: "",
      gpsLink: ""
    }
  });
  
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

  // Automatiskt uppdatera namnet när hemmalag eller bortalag ändras för matcher
  useEffect(() => {
    if (formData.type === "match" && formData.homeTeam && formData.awayTeam) {
      setFormData(prev => ({
        ...prev,
        name: `${formData.homeTeam} - ${formData.awayTeam}`
      }));
    }
  }, [formData.type, formData.homeTeam, formData.awayTeam]);

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
    setFormData(prev => ({ 
      ...prev, 
      type: newType,
      // Rensa hemmalag/bortalag när man byter till cup
      ...(newType === "cup" ? { homeTeam: "", awayTeam: "" } : {})
    }));
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
      homeTeam: formData.type === "match" ? formData.homeTeam : undefined,
      awayTeam: formData.type === "match" ? formData.awayTeam : undefined,
      location: formData.location.name ? formData.location : undefined,
      participants: selectedPlayerIds
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
            {formData.type === "match" ? (
              <>
                <div>
                  <Label htmlFor="homeTeam">Hemmalag</Label>
                  <Input
                    id="homeTeam"
                    value={formData.homeTeam}
                    onChange={(e) => setFormData(prev => ({ ...prev, homeTeam: e.target.value }))}
                    placeholder="Ange hemmalag"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="awayTeam">Bortalag</Label>
                  <Input
                    id="awayTeam"
                    value={formData.awayTeam}
                    onChange={(e) => setFormData(prev => ({ ...prev, awayTeam: e.target.value }))}
                    placeholder="Ange bortalag"
                    required
                  />
                </div>
              </>
            ) : (
              <div className="col-span-2">
                <Label htmlFor="name">Cupnamn</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
            )}
            
            <div className="col-span-2">
              <Label>Typ</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={handleTypeChange}
                className="flex gap-4"
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
            <Button 
              type="submit" 
              disabled={
                !formData.date || 
                (formData.type === "match" && (!formData.homeTeam || !formData.awayTeam)) ||
                (formData.type === "cup" && !formData.name)
              }
            >
              Spara aktivitet
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
