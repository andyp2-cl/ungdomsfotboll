
import React, { useState } from "react";
import { Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";

interface LinkExistingMatchesProps {
  cupActivity: Activity;
  allActivities: Activity[];
  onLinkMatches: (cupId: string, matchIds: string[]) => Promise<void>;
}

export function LinkExistingMatches({
  cupActivity,
  allActivities,
  onLinkMatches
}: LinkExistingMatchesProps) {
  const [selectedMatches, setSelectedMatches] = useState<string[]>([]);
  const [isLinking, setIsLinking] = useState(false);

  // Get all matches that are not already linked to any cup
  const availableMatches = allActivities.filter(activity => 
    activity.type === "match" && 
    !activity.cupId && 
    activity.id !== cupActivity.id
  );

  // Get already linked matches for this cup
  const linkedMatches = allActivities.filter(activity => 
    activity.cupId === cupActivity.id
  );

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
    <div className="space-y-6">
      {/* Already linked matches */}
      {linkedMatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kopplade matcher ({linkedMatches.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {linkedMatches.map(match => (
                <div key={match.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                  <div className="flex-1">
                    <div className="font-medium">{match.name}</div>
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
                  <Badge variant="secondary">Kopplad</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available matches to link */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Koppla befintliga matcher</CardTitle>
          <p className="text-sm text-muted-foreground">
            Välj matcher som ska kopplas till denna cup. Endast matcher som inte redan är kopplade till en annan cup visas.
          </p>
        </CardHeader>
        <CardContent>
          {availableMatches.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Inga tillgängliga matcher att koppla. Alla matcher är redan kopplade till cuper eller så finns inga matcher.
            </p>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                {availableMatches.map(match => (
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
                ))}
              </div>
              
              {selectedMatches.length > 0 && (
                <Button 
                  onClick={handleLinkSelectedMatches}
                  disabled={isLinking}
                  className="w-full"
                >
                  {isLinking ? "Kopplar..." : `Koppla ${selectedMatches.length} matcher`}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
