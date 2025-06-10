import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Calendar, BarChart3, TrendingUp, Dumbbell, FileSpreadsheet } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-100">
      <div className="text-center p-6 max-w-md mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-[#006633]">Hässleholms IF P2014</h1>
        <p className="text-xl text-gray-600 mb-8">Hantera dina fotbollsspelare och aktiviteter enkelt och smidigt</p>
        
        <div className="flex flex-col items-center gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <Link to="/players" className="w-full">
              <Button size="lg" className="w-full gap-2 h-16">
                <Users className="h-5 w-5" />
                Spelare
              </Button>
            </Link>
            
            <Link to="/activities" className="w-full">
              <Button size="lg" className="w-full gap-2 h-16">
                <Calendar className="h-5 w-5" />
                Aktiviteter
              </Button>
            </Link>

            <Link to="/statistics" className="w-full">
              <Button size="lg" className="w-full gap-2 h-16">
                <BarChart3 className="h-5 w-5" />
                Statistik
              </Button>
            </Link>

            <Link to="/development" className="w-full">
              <Button size="lg" className="w-full gap-2 h-16">
                <TrendingUp className="h-5 w-5" />
                Utveckling
              </Button>
            </Link>

            <Link to="/training" className="w-full">
              <Button size="lg" className="w-full gap-2 h-16">
                <Dumbbell className="h-5 w-5" />
                Träning
              </Button>
            </Link>

            <Link to="/excel" className="w-full">
              <Button size="lg" className="w-full gap-2 h-16">
                <FileSpreadsheet className="h-5 w-5" />
                Excel
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
