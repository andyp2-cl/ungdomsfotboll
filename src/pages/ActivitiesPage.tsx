
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { getStoredActivities } from "@/utils/storage/activity/fetch";
import { LoadingState } from "@/components/LoadingState";
import { Activity } from "@/types/player";

const ActivitiesPage = () => {
  const [activeTab, setActiveTab] = useState('activities');

  // Fetch activities using React Query
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ['activities'],
    queryFn: getStoredActivities,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Ensure the active tab is set to 'activities'
  useEffect(() => {
    setActiveTab('activities');
  }, []);

  return (
    <Layout activeTab={activeTab}>
      {isLoading ? (
        <LoadingState message="Laddar aktiviteter..." />
      ) : error ? (
        <div className="p-4">
          <p className="text-red-500">Ett fel uppstod: {String(error)}</p>
        </div>
      ) : activities && activities.length > 0 ? (
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Aktiviteter</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.map((activity: Activity) => (
              <div key={activity.id} className="bg-white p-4 rounded-lg shadow">
                <h2 className="font-bold">{activity.name}</h2>
                <p className="text-gray-600">{activity.date} {activity.time}</p>
                <p className="mt-2">{activity.type}</p>
                {activity.location_name && (
                  <p className="text-sm mt-2">{activity.location_name}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 text-center">
          <p className="text-gray-500">Inga aktiviteter att visa.</p>
        </div>
      )}
    </Layout>
  );
};

export default ActivitiesPage;
