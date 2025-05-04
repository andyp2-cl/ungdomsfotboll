
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Info, RefreshCw, Database } from 'lucide-react';
import { Activity } from "@/types/player";
import { PageContainer } from "@/components/PageContainer";
import { PageTitle } from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import { getStoredActivities } from "@/utils/storage/activity/fetch";
import { forceRefreshAllActivities } from "@/utils/storage/activity/fetch";
import { refreshPlayerActivitiesCache } from "@/lib/supabase/playerActivities";
import { clearActivitiesCache } from "@/utils/storage/activity/cache-operations";
import { toast } from "sonner";
import { supabase } from '@/lib/supabase/client';

export function ActivitiesPage() {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  
  // Check database connection on load
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('count()')
          .limit(1)
          .single();
          
        if (error) {
          console.error("Database connection error:", error);
          setConnectionStatus('disconnected');
        } else {
          console.log("Database connection successful");
          setConnectionStatus('connected');
        }
      } catch (err) {
        console.error("Error checking database connection:", err);
        setConnectionStatus('disconnected');
      }
    };
    
    checkConnection();
  }, []);
  
  // Fetch activities using React Query
  const { 
    data: activities, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['activities'],
    queryFn: getStoredActivities,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      toast.info("Rensar cache och uppdaterar data...");
      
      // Clear local cache first
      clearActivitiesCache();
      
      // Clear service worker cache if available
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        try {
          const messageChannel = new MessageChannel();
          navigator.serviceWorker.controller.postMessage({
            type: 'CLEAR_API_CACHE',
            timestamp: Date.now()
          }, [messageChannel.port2]);
          console.log("Sent cache clear request to service worker");
        } catch (e) {
          console.error("Error communicating with service worker:", e);
        }
      }
      
      // Force refresh all data
      await forceRefreshAllActivities();
      await refreshPlayerActivitiesCache();
      
      // Refetch data using React Query's refetch mechanism
      await refetch();
      
      toast.success("Data har uppdaterats från databasen", {
        duration: 3000,
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Kunde inte uppdatera data", {
        duration: 3000,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTestDatabaseConnection = async () => {
    toast.loading("Testar databasanslutning...");
    setConnectionStatus('checking');
    
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('id, name')
        .limit(1);
        
      if (error) {
        console.error("Database connection error:", error);
        toast.error("Kunde inte ansluta till databasen: " + error.message);
        setConnectionStatus('disconnected');
      } else {
        console.log("Database connection successful:", data);
        toast.success("Databasanslutning fungerar korrekt!");
        setConnectionStatus('connected');
      }
    } catch (error) {
      console.error("Error testing database connection:", error);
      toast.error("Ett fel uppstod vid test av databasanslutning");
      setConnectionStatus('disconnected');
    }
  };
  
  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-4">
        <PageTitle>Aktiviteter</PageTitle>
        
        <div className="flex gap-2">
          {/* Status indicator */}
          <div className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm ${
            connectionStatus === 'connected' ? 'bg-green-50 text-green-700' :
            connectionStatus === 'disconnected' ? 'bg-red-50 text-red-700' :
            'bg-gray-50 text-gray-700'
          }`}>
            <div className={`h-2 w-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' :
              connectionStatus === 'disconnected' ? 'bg-red-500' :
              'bg-gray-500'
            }`}></div>
            <span className="hidden sm:inline">
              {connectionStatus === 'connected' ? 'Databas ansluten' :
               connectionStatus === 'disconnected' ? 'Databas frånkopplad' :
               'Kontrollerar anslutning...'}
            </span>
          </div>
          
          {/* Database connection test button */}
          <Button 
            variant="outline"
            size="sm"
            onClick={handleTestDatabaseConnection}
            className="hidden sm:flex"
          >
            <Database className="h-4 w-4 mr-2" />
            Testa anslutning
          </Button>
          
          {/* Add a refresh button for easy data refresh */}
          <Button 
            variant="outline"
            size="sm"
            onClick={handleRefreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Uppdatera data
          </Button>
          
          {/* Add a button to navigate to the add activity page */}
          <Button size="sm" onClick={() => navigate('/activities/add')}>
            <Plus className="h-4 w-4 mr-2" />
            Lägg till aktivitet
          </Button>
        </div>
      </div>
      
      {isLoading && <p>Laddar aktiviteter...</p>}
      {error && <p>Fel vid hämtning av aktiviteter: {error.message}</p>}
      
      {activities && activities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((activity: Activity) => (
            <div key={activity.id} className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold">{activity.name}</h3>
              <p className="text-gray-500">{activity.date}</p>
              {activity.result && (
                <p className="mt-2">
                  <span className="font-medium">Resultat: </span>
                  <span className={`font-semibold ${
                    activity.isWin === true ? 'text-green-600' : 
                    activity.isWin === false ? 'text-red-600' : 
                    ''
                  }`}>
                    {activity.result}
                  </span>
                </p>
              )}
            </div>
          ))}
        </div>
      ) : null}
      
      {activities && activities.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
          <Info className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Inga aktiviteter hittades</h3>
          <p className="text-gray-500 mb-6 text-center max-w-md">
            Det finns inga aktiviteter att visa. Du kan importera aktiviteter från filer eller lägga till manuellt.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button onClick={() => navigate('/activities/add')}>
              <Plus className="h-4 w-4 mr-2" />
              Lägg till manuellt
            </Button>
            <Button variant="outline" onClick={handleRefreshData} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Uppdatera data
            </Button>
          </div>
        </div>
      )}
      
    </PageContainer>
  );
}

export default ActivitiesPage;
