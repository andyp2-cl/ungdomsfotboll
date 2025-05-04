
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";

const ActivitiesPage = () => {
  const [activeTab, setActiveTab] = useState('activities');

  // Ensure the active tab is set to 'activities'
  useEffect(() => {
    setActiveTab('activities');
  }, []);

  return (
    <Layout activeTab={activeTab}>
      {/* Content will be rendered by the Layout component */}
    </Layout>
  );
};

export default ActivitiesPage;
