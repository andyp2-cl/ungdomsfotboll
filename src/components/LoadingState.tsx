
import React from "react";
import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  error?: string;
  retry?: () => void;
}

export function LoadingState({ 
  message = "Laddar data från databasen...", 
  error,
  retry 
}: LoadingStateProps) {
  const isOnline = navigator.onLine;
  
  // Show error state if there's an error message
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="mb-4">{error}</p>
          {retry && (
            <button 
              onClick={retry} 
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Försök igen
            </button>
          )}
        </div>
      </div>
    );
  }
  
  // Show loading state
  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p>{message}</p>
        
        {/* Network status indicator */}
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
        
        <p className="text-sm text-gray-500 mt-2">
          Om detta tar lång tid, kontrollera nätverksanslutningen
        </p>
        
        {/* Alternative action if loading takes too long */}
        {retry && (
          <button 
            onClick={retry} 
            className="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mx-auto"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Ladda om data
          </button>
        )}
      </div>
    </div>
  );
}
