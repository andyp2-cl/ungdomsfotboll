
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { AlertTriangle, Clock, Lock } from 'lucide-react';
import { BackupInfo } from './types';

interface RestoreFormProps {
  backupInfo: BackupInfo | null;
  password: string;
  setPassword: (value: string) => void;
  passwordError: string;
  showDebug: boolean;
  setShowDebug: (value: boolean) => void;
  showRaw: boolean;
  setShowRaw: (value: boolean) => void;
  rawBackupData: any;
  validatePassword: () => boolean;
}

export function RestoreForm({
  backupInfo,
  password,
  setPassword,
  passwordError,
  showDebug,
  setShowDebug,
  showRaw,
  setShowRaw,
  rawBackupData,
  validatePassword,
}: RestoreFormProps) {
  const formattedBackupDate = backupInfo?.timestamp 
    ? format(new Date(backupInfo.timestamp), 'yyyy-MM-dd HH:mm:ss')
    : null;

  return (
    <div>
      <p>Detta kommer att återställa alla spelare och aktiviteter till den senaste säkerhetskopian.</p>
      {formattedBackupDate ? (
        <div className="mt-2 font-medium">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            Säkerhetskopia från: {formattedBackupDate}
          </div>
          <div className="text-muted-foreground mt-1">
            Innehåller {backupInfo?.playerCount} spelare och {backupInfo?.activityCount} aktiviteter.
          </div>
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-2 font-medium text-amber-500">
          <AlertTriangle className="h-4 w-4" />
          Ingen säkerhetskopia hittades eller så saknar den data.
        </div>
      )}
      
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="restore-password" className="font-medium">Ange lösenord för att fortsätta:</Label>
        </div>
        <Input 
          id="restore-password"
          type="password"
          placeholder="Lösenord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={passwordError ? "border-red-500" : ""}
        />
        {passwordError && (
          <p className="text-red-500 text-sm">{passwordError}</p>
        )}
      </div>
      
      <div className="mt-4">
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id="debug-mode" 
            checked={showDebug} 
            onChange={() => setShowDebug(!showDebug)}
            className="accent-primary h-4 w-4"
          />
          <label htmlFor="debug-mode" className="text-sm text-muted-foreground cursor-pointer">
            Visa detaljerad information vid återställning
          </label>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <input 
            type="checkbox" 
            id="raw-mode" 
            checked={showRaw} 
            onChange={() => setShowRaw(!showRaw)}
            className="accent-primary h-4 w-4"
          />
          <label htmlFor="raw-mode" className="text-sm text-muted-foreground cursor-pointer">
            Visa rå data från säkerhetskopia
          </label>
        </div>
      </div>
      
      {showRaw && rawBackupData && (
        <div className="mt-4 text-xs bg-gray-100 p-2 rounded-md max-h-36 overflow-y-auto">
          <p>Players: {rawBackupData.players?.length || 0}</p>
          <p>Activities: {rawBackupData.activities?.length || 0}</p>
          <p>Matches: {rawBackupData.activities?.filter((a: any) => a.type === 'match').length || 0}</p>
          <p>Timestamp: {rawBackupData.timestamp}</p>
        </div>
      )}
      
      <p className="mt-4 font-medium text-destructive">
        Varning: Alla ändringar sedan senaste säkerhetskopian kommer att förloras.
      </p>
    </div>
  );
}
