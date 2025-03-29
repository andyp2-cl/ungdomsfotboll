
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Activity, Calendar } from "lucide-react";

export function PlayerHeader() {
  return (
    <header className="mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <img
            src="/hassleholmsif-logo.svg"
            alt="Hässleholms IF"
            className="w-36 h-auto"
          />
          <h1 className="text-xl font-semibold mt-2">
            Spelarhantering - P12 Svart
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/players" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Spelare</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/activities" className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Aktiviteter</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/calendar" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Kalender</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
