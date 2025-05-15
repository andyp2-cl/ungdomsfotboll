
import React, { useState } from 'react';
import { Activity } from "@/types/player";
import { formatDate } from '../utils/date-formatter';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Trophy } from "lucide-react";

interface CupsTabContentProps {
  cups: Activity[];
  onActivitySelect: (activity: Activity) => void;
}

export function CupsTabContent({ cups, onActivitySelect }: CupsTabContentProps) {
  return (
    <>
      {cups.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cups.map(cup => (
            <Card 
              key={cup.id} 
              className="cursor-pointer hover:bg-accent/5 transition-colors"
              onClick={() => onActivitySelect(cup)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-amber-100 text-amber-700 p-2 rounded-lg">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">{cup.name}</h4>
                    <p className="text-sm text-muted-foreground">{formatDate(cup.date)}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
