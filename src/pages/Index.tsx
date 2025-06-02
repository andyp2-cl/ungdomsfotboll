
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect directly to players page
    navigate("/players");
  }, [navigate]);
  
  // Show a loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-[#006633]">Hässleholms IF P2014</h1>
        <p className="text-xl text-gray-600">Laddar...</p>
      </div>
    </div>
  );
}

export default Index;
