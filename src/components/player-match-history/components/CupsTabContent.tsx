
import React from "react";
import { Player, Activity } from "@/types/player";

interface CupsTabContentProps {
  player: Player;
  cups: Activity[];
}

export function CupsTabContent({ player, cups }: CupsTabContentProps) {
  return (
    <div>
      {cups.length > 0 ? (
        <div className="space-y-4">
          {cups.map(cup => (
            <div key={cup.id} className="border rounded-md p-4">
              <h3 className="font-medium">{cup.name}</h3>
              <div className="text-sm text-muted-foreground mt-1">
                <div>{formatDate(cup.date)}</div>
                {cup.location?.name && <div>{cup.location.name}</div>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Spelaren har inte deltagit i några cuper ännu
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr: string) {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  } catch (e) {
    return dateStr;
  }
}
