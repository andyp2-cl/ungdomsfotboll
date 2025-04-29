
import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

interface LoadingSpinnerProps {
  retry?: () => void;
}

export function LoadingSpinner({ retry }: LoadingSpinnerProps) {
  const [loadTime, setLoadTime] = useState(0);

  // Track loading time
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
      
      {loadTime > 8 && (
        <p className="text-sm text-gray-500 mt-2">
          Om detta tar lång tid, kontrollera nätverksanslutningen
        </p>
      )}
      
      {/* Alternative action if loading takes too long */}
      {loadTime > 12 && retry && (
        <button 
          onClick={retry} 
          className="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mx-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Ladda om data
        </button>
      )}
    </div>
  );
}
