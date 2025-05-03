
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Power, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface DiagnosticToolsProps {
  clearAuthAndReconnect: () => Promise<void>;
  isPerformingReset: boolean;
}

export function DiagnosticTools({ clearAuthAndReconnect, isPerformingReset }: DiagnosticToolsProps) {
  return (
    <div className="border-t pt-4 mt-6">
      <h3 className="text-base font-medium mb-2">Felsökningsverktyg</h3>
      
      <div className="space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={() => {
            localStorage.removeItem('sb-activities-fetch-time');
            localStorage.removeItem('sb-connection-test');
            localStorage.removeItem('sb-connection-test-time');
            toast.success("Cachen rensad. Laddar om...");
            setTimeout(() => window.location.reload(), 1000);
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Rensa connection cache och ladda om
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={clearAuthAndReconnect}
          disabled={isPerformingReset}
        >
          <Power className="h-4 w-4 mr-2 text-amber-600" />
          Fullständig återställning
        </Button>
        
        <div className="text-xs text-amber-700 p-2 bg-amber-50 rounded mt-2">
          <div className="flex gap-1 items-center mb-1">
            <AlertTriangle className="h-4 w-4" />
            <strong>Fullständig återställning</strong>
          </div>
          Använd detta alternativ om inget annat fungerar. Detta rensar alla cachade 
          data, loggar ut dig och försöker återansluta. Sidan kommer att laddas om.
        </div>
      </div>
    </div>
  );
}
