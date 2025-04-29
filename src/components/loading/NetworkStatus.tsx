
import React from "react";
import { Wifi, WifiOff } from "lucide-react";

interface NetworkStatusProps {
  isOnline: boolean;
}

export function NetworkStatus({ isOnline }: NetworkStatusProps) {
  return (
    <div className="flex items-center justify-center mt-4 text-sm text-gray-500 gap-1.5">
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-green-600" />
          <span>Ansluten till nätverket</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-600" />
          <span>Offline-läge</span>
        </>
      )}
    </div>
  );
}
