
export type ConnectionStats = {
  successCount: number;
  failCount: number;
  lastAttemptTime: number;
  averageConnectionTime: number;
  totalAttempts: number;
};

export type DatabaseStatus = 'unknown' | 'connecting' | 'connected' | 'error';

export type UseDatabaseCheckResult = {
  dbStatus: DatabaseStatus;
  dbError: string | null;
  isCheckingDb: boolean;
  setIsCheckingDb: (isChecking: boolean) => void;
  setDbStatus: (status: DatabaseStatus) => void;
  connectionAttempts: number;
  connectionStats: ConnectionStats;
  checkDbConnection: (force?: boolean) => Promise<void>;
};
