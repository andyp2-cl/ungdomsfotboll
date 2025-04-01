
import React from "react";
import { Database } from "lucide-react";

export function BackupTips() {
  return (
    <div className="p-2 bg-slate-50 rounded-md border text-xs">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        <Database className="h-3.5 w-3.5" />
        <span className="font-medium">Tips för säkerhetskopiering:</span>
      </div>
      <ol className="list-decimal ml-4 space-y-1 text-muted-foreground">
        <li>Skapa alltid en säkerhetskopia innan du gör större ändringar.</li>
        <li>Om återställning misslyckas, prova att skapa en ny säkerhetskopia och återställ igen.</li>
        <li>Efter återställning, ladda om sidan för att se ändringarna.</li>
      </ol>
    </div>
  );
}
