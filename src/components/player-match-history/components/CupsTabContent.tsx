
import React from 'react';
import { Activity } from "@/types/player";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import { formatDate } from '../utils/date-formatter';

interface CupsTabContentProps {
  cups: Activity[];
  onActivitySelect: (activity: Activity) => void;
}

export function CupsTabContent({ cups, onActivitySelect }: CupsTabContentProps) {
  return (
    <>
      {cups.length > 0 ? (
        <div className="space-y-4">
          {cups.map(cup => (
            <Card key={cup.id} className="hover:bg-accent/5 cursor-pointer" onClick={() => onActivitySelect(cup)}>
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium">{cup.name}</h4>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(cup.date)}
                      {cup.time && (
                        <span className="ml-2 flex items-center">
                          <Clock className="h-3 w-3 ml-2 mr-1" />
                          {cup.time}
                        </span>
                      )}
                    </div>
                    {cup.location && (
                      <div className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {cup.location.name}
                      </div>
                    )}
                  </div>
                  <Badge>
                    {cup.matches?.length || 0} matcher
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Spelaren har inte deltagit i några cuper ännu
        </div>
      )}
    </>
  );
}
