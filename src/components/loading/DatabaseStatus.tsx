
import React from "react";
import { Database, AlertCircle } from "lucide-react";

interface DatabaseStatusProps {
  status: 'unknown' | 'connecting' | 'connected' | 'error';
  errorMessage: string | null;
  isOnline: boolean;
  onDiagnostic: () => void;
  isCheckingDb: boolean;
}

export function DatabaseStatus({ 
  status, 
  errorMessage, 
  isOnline, 
  onDiagnostic, 
  isCheckingDb 
}: DatabaseStatusProps) {
  if (!isOnline) return null;
  
  return (
    <div className="flex flex-col items-center justify-center mt-2">
      <div className="flex items-center justify-center text-sm gap-1.5">
        {status === 'connecting' && (
          <div className="text-amber-600 flex items-center gap-1.5">
            <Database className="h-4 w-4 animate-pulse" />
            <span>Ansluter till databasen...</span>
          </div>
        )}
        
        {status === 'connected' && (
          <div className="text-green-600 flex items-center gap-1.5">
            <Database className="h-4 w-4" />
            <span>Ansluten till databasen</span>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-red-600 flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4" />
            <span>{errorMessage || "Databasfel"}</span>
          </div>
        )}
      </div>
      
      {status === 'error' && (
        <button
          onClick={onDiagnostic}
          disabled={isCheckingDb}
          className="mt-4 bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded text-sm flex items-center gap-2 mx-auto"
        >
          <Database className="h-4 w-4" />
          {isCheckingDb ? "Kontrollerar databas..." : "Diagnostisera databasanslutning"}
        </button>
      )}
    </div>
  );
}
