
import React from "react";
import { NavigationButtons } from "./NavigationButtons";
import { ConnectionStatus } from "./ConnectionStatus";

interface HomeContentProps {
  syncStatus: "connected" | "connecting" | "disconnected" | "not-configured";
  isReconnecting: boolean;
  isOnline: boolean;
  setSyncStatus: (status: "connected" | "connecting" | "disconnected" | "not-configured") => void;
}

export const HomeContent = ({ 
  syncStatus, 
  isReconnecting, 
  isOnline,
  setSyncStatus
}: HomeContentProps) => {
  return (
    <div className="text-center p-6 max-w-md mx-auto">
      <h1 className="text-4xl font-bold mb-4 text-[#006633]">Hässleholms IF P2014</h1>
      <p className="text-xl text-gray-600 mb-8">Hantera dina fotbollsspelare och aktiviteter enkelt och smidigt</p>
      
      <div className="flex flex-col items-center gap-4">
        <NavigationButtons />
        
        <div className="flex items-center gap-2 text-sm mt-6">
          <ConnectionStatus 
            syncStatus={syncStatus}
            isReconnecting={isReconnecting}
            isOnline={isOnline}
            setSyncStatus={setSyncStatus}
          />
        </div>
      </div>
    </div>
  );
};
