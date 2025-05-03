
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Info, RefreshCw } from 'lucide-react';
import { Activity } from "@/types/player";
import { PageContainer } from "@/components/PageContainer";
import { PageTitle } from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import { getStoredActivities } from "@/utils/storage/activity/fetch";
import { forceRefreshAllActivities } from "@/utils/storage/activity/fetch";
import { refreshPlayerActivitiesCache } from "@/lib/supabase/playerActivities";
import { clearActivitiesCache } from "@/utils/storage/activity/cache-operations";
import { toast } from "sonner";

export function ActivitiesPage() {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
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
      
      toast.success("Data har uppdaterats", {
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
  
  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-4">
        <PageTitle>Aktiviteter</PageTitle>
        
        <div className="flex gap-2">
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
