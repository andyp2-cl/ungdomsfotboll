
import React from "react";
import { AlertCircle } from "lucide-react";

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
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm"
            >
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
        <p className="text-sm text-gray-500 mt-2">Om detta tar lång tid, kontrollera nätverksanslutningen</p>
      </div>
    </div>
  );
}
