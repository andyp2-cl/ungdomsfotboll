
import React, { useState, useEffect } from "react";
import { getApiCacheStats } from "@/utils/cache/apiCache";
import { Activity } from "lucide-react";

export function PerformanceMonitor() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [stats, setStats] = useState({
    cache: {
      totalEntries: 0,
      totalSaves: 0,
      totalHits: 0,
      hitRate: 0
    },
    network: {
      totalRequests: 0,
      failedRequests: 0,
      averageTime: 0
    },
    localStorage: {
      used: 0,
      max: 5242880, // 5MB typical limit
      percentage: 0
    }
  });
  
  useEffect(() => {
    const updateStats = () => {
      // Get API cache stats
      const cacheStats = getApiCacheStats();
      
      // Calculate localStorage usage
      let totalSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          totalSize += (localStorage.getItem(key) || '').length;
        }
      }
      
      // Network stats from saved metrics
      const fetchTimeStr = localStorage.getItem('sb-activities-fetch-duration');
      const fetchTime = fetchTimeStr ? parseInt(fetchTimeStr) : 0;
      
      // Get successful and failed connection attempts
      const successCount = Number(localStorage.getItem('sb-success-count') || '0');
      const failCount = Number(localStorage.getItem('db-connection-failed-count') || '0');
      
      setStats({
        cache: {
          ...cacheStats
        },
        network: {
          totalRequests: successCount + failCount,
          failedRequests: failCount,
          averageTime: fetchTime
        },
        localStorage: {
          used: totalSize,
          max: 5242880,
          percentage: (totalSize / 5242880) * 100
        }
      });
    };
    
    updateStats();
    const interval = setInterval(updateStats, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (!isExpanded) {
    return (
      <button 
        className="fixed bottom-2 right-2 bg-gray-100 p-1 rounded-full opacity-70 hover:opacity-100"
        onClick={() => setIsExpanded(true)}
        title="Visa prestandastatistik"
      >
        <Activity className="h-4 w-4 text-gray-500" />
      </button>
    );
  }
  
  return (
    <div className="fixed bottom-2 right-2 bg-white p-3 rounded-lg shadow-lg text-xs border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium">Prestandastatistik</h4>
        <button 
          className="text-gray-400 hover:text-gray-600" 
          onClick={() => setIsExpanded(false)}
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <h5 className="text-gray-500">Cache</h5>
          <div className="grid grid-cols-2 gap-x-4">
            <div>Poster: {stats.cache.totalEntries}</div>
            <div>Träffrekvens: {stats.cache.hitRate.toFixed(1)}%</div>
          </div>
        </div>
        
        <div>
          <h5 className="text-gray-500">Nätverk</h5>
          <div>
            Anrop: {stats.network.totalRequests} 
            (Misslyck: {stats.network.failedRequests})
          </div>
          <div>Senaste hämtning: {stats.network.averageTime.toFixed(0)}ms</div>
        </div>
        
        <div>
          <h5 className="text-gray-500">Lagring (localStorage)</h5>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full ${stats.localStorage.percentage > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min(stats.localStorage.percentage, 100)}%` }}
            ></div>
          </div>
          <div className="text-right text-gray-400 mt-1">
            {(stats.localStorage.used / 1024).toFixed(1)}KB av {(stats.localStorage.max / 1024).toFixed(0)}KB
          </div>
        </div>
      </div>
    </div>
  );
}
