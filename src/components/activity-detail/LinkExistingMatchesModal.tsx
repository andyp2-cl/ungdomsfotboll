
import React, { useState } from "react";
import { Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface LinkExistingMatchesModalProps {
  cupActivity: Activity;
  allActivities: Activity[];
  onLinkMatches: (cupId: string, matchIds: string[]) => Promise<void>;
}

export function LinkExistingMatchesModal({
  cupActivity,
  allActivities,
  onLinkMatches
}: LinkExistingMatchesModalProps) {
  const [selectedMatches, setSelectedMatches] = useState<string[]>([]);
  const [isLinking, setIsLinking] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Get all matches that are not already linked to any cup
  // FIXED: Exclude the cup itself and sort by date (latest first)
  const availableMatches = allActivities
    .filter(activity => 
      activity.type === "match" && 
      !activity.cupId && 
      activity.id !== cupActivity.id
    )
    .sort((a, b) => {
      // Sort by date (latest first)
      const dateA = new Date(a.date + (a.time ? ` ${a.time}` : ''));
      const dateB = new Date(b.date + (b.time ? ` ${b.time}` : ''));
      return dateB.getTime() - dateA.getTime();
    });

  const handleMatchSelection = (matchId: string, checked: boolean) => {
    if (checked) {
      setSelectedMatches(prev => [...prev, matchId]);
    } else {
      setSelectedMatches(prev => prev.filter(id => id !== matchId));
    }
  };

  const handleLinkSelectedMatches = async () => {
    if (selectedMatches.length === 0) return;
    
    setIsLinking(true);
    try {
      await onLinkMatches(cupActivity.id, selectedMatches);
      setSelectedMatches([]);
      setIsOpen(false);
    } catch (error) {
      console.error("Error linking matches:", error);
    } finally {
      setIsLinking(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('sv-SE');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Koppla befintliga matcher
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Koppla befintliga matcher till {cupActivity.name}</DialogTitle>
          <DialogDescription>
            Välj matcher som ska kopplas till denna cup. Endast matcher som inte redan är kopplade till en annan cup visas. Senaste matcher visas först.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          {availableMatches.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Inga tillgängliga matcher att koppla. Alla matcher är redan kopplade till cuper eller så finns inga matcher.
            </p>
          ) : (
            availableMatches.map(match => (
              <div key={match.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <Checkbox
                  id={match.id}
                  checked={selectedMatches.includes(match.id)}
                  onCheckedChange={(checked) => handleMatchSelection(match.id, checked as boolean)}
                />
                <div className="flex-1">
                  <label htmlFor={match.id} className="font-medium cursor-pointer">
                    {match.name}
                  </label>
                  <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(match.date)}
                    </span>
                    {match.time && (
                      <span>{match.time}</span>
                    )}
                    {match.location?.name && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {match.location.name}
                      </span>
                    )}
                    {match.participants && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {match.participants.length}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Avbryt
          </Button>
          {selectedMatches.length > 0 && (
            <Button 
              onClick={handleLinkSelectedMatches}
              disabled={isLinking}
            >
              {isLinking ? "Kopplar..." : `Koppla ${selectedMatches.length} matcher`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
