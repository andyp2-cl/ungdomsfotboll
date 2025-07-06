import { useEffect, useRef, useCallback } from 'react';
import { measurePerformance, measureAsyncPerformance } from '@/utils/performance';

interface PerformanceMetrics {
  renderTime: number;
  mountTime: number;
  updateCount: number;
  lastUpdate: number;
}

interface UsePerformanceMonitorOptions {
  componentName?: string;
  enabled?: boolean;
  logToConsole?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

export function usePerformanceMonitor(options: UsePerformanceMonitorOptions = {}) {
  const {
    componentName = 'Unknown',
    enabled = process.env.NODE_ENV === 'development',
    logToConsole = true,
    onMetricsUpdate
  } = options;

  const metricsRef = useRef<PerformanceMetrics>({
    renderTime: 0,
    mountTime: 0,
    updateCount: 0,
    lastUpdate: 0
  });

  const startTimeRef = useRef<number>(0);

  const measureRender = useCallback(() => {
    if (!enabled) return;

    const endTime = performance.now();
    const renderTime = endTime - startTimeRef.current;

    metricsRef.current = {
      ...metricsRef.current,
      renderTime,
      updateCount: metricsRef.current.updateCount + 1,
      lastUpdate: Date.now()
    };

    if (logToConsole) {
      console.log(`[Performance] ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
    }

    onMetricsUpdate?.(metricsRef.current);
  }, [enabled, componentName, logToConsole, onMetricsUpdate]);

  // Measure mount time
  useEffect(() => {
    if (!enabled) return;

    const mountTime = performance.now() - startTimeRef.current;
    metricsRef.current.mountTime = mountTime;

    if (logToConsole) {
      console.log(`[Performance] ${componentName} mounted in ${mountTime.toFixed(2)}ms`);
    }

    onMetricsUpdate?.(metricsRef.current);
  }, [enabled, componentName, logToConsole, onMetricsUpdate]);

  // Measure render time
  useEffect(() => {
    if (!enabled) return;

    startTimeRef.current = performance.now();
    
    return () => {
      measureRender();
    };
  }, [enabled, measureRender]);

  const getMetrics = useCallback(() => metricsRef.current, []);

  const resetMetrics = useCallback(() => {
    metricsRef.current = {
      renderTime: 0,
      mountTime: 0,
      updateCount: 0,
      lastUpdate: 0
    };
  }, []);

  return {
    getMetrics,
    resetMetrics,
    measureRender
  };
}

// Hook for measuring async operations
export function useAsyncPerformanceMonitor(options: UsePerformanceMonitorOptions = {}) {
  const {
    componentName = 'Unknown',
    enabled = process.env.NODE_ENV === 'development',
    logToConsole = true
  } = options;

  const measureAsyncOperation = useCallback(async <T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    if (!enabled) {
      return operation();
    }

    return measureAsyncPerformance(
      `[${componentName}] ${operationName}`,
      operation
    );
  }, [enabled, componentName]);

  const measureSyncOperation = useCallback(<T>(
    operationName: string,
    operation: () => T
  ): T => {
    if (!enabled) {
      return operation();
    }

    return measurePerformance(
      `[${componentName}] ${operationName}`,
      operation
    );
  }, [enabled, componentName]);

  return {
    measureAsyncOperation,
    measureSyncOperation
  };
}

// Hook for monitoring memory usage
export function useMemoryMonitor(options: { enabled?: boolean; interval?: number } = {}) {
  const { enabled = process.env.NODE_ENV === 'development', interval = 30000 } = options;

  useEffect(() => {
    if (!enabled || !('memory' in performance)) return;

    const checkMemory = () => {
      const memory = (performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
      const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);

      console.log(`[Memory] Used: ${usedMB}MB / Total: ${totalMB}MB / Limit: ${limitMB}MB`);

      // Warn if memory usage is high
      if (usedMB / limitMB > 0.8) {
        console.warn(`[Memory] High memory usage detected: ${usedMB}MB / ${limitMB}MB`);
      }
    };

    const intervalId = setInterval(checkMemory, interval);
    checkMemory(); // Initial check

    return () => clearInterval(intervalId);
  }, [enabled, interval]);
}

// Hook for monitoring network performance
export function useNetworkMonitor(options: { enabled?: boolean } = {}) {
  const { enabled = process.env.NODE_ENV === 'development' } = options;

  useEffect(() => {
    if (!enabled || !('connection' in navigator)) return;

    const connection = (navigator as any).connection;
    
    const logNetworkInfo = () => {
      console.log(`[Network] Type: ${connection.effectiveType}, Downlink: ${connection.downlink}Mbps`);
    };

    connection.addEventListener('change', logNetworkInfo);
    logNetworkInfo(); // Initial log

    return () => {
      connection.removeEventListener('change', logNetworkInfo);
    };
  }, [enabled]);
} 