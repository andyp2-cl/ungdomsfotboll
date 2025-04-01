
import { useState } from "react";
import { Player, Activity, PlayerPosition } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActivityList } from "./ActivityList";
import { EditPlayerForm } from "./EditPlayerForm";
import { Edit, X, UserCircle, Award, BarChart2, Calendar } from "lucide-react";
import { calculatePlayerStatistics, sortActivitiesByDate } from "@/utils/playerStatistics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "./ui/separator";

interface PlayerDetailProps {
  player: Player;
  activities: Activity[];
  onClose: () => void;
  onPlayerUpdate?: (updatedPlayer: Player) => void;
  allPlayers?: Player[];
}

export function PlayerDetail({ player, activities, onClose, onPlayerUpdate, allPlayers = [] }: PlayerDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(player);
  const [activeTab, setActiveTab] = useState<"activities" | "statistics">("activities");
  
  // Filter activities that the player participates in
  const playerActivities = sortActivitiesByDate(
    activities.filter((activity) => currentPlayer.activities?.includes(activity.id))
  );
  
  // Get player statistics
  const playerStats = calculatePlayerStatistics(currentPlayer, activities);
  
  // Function to show color based on player level
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-green-500';
      case 'B':
        return 'bg-blue-500';
      case 'C':
        return 'bg-orange-500';
      case 'D':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Function to show level text
  const getGradeText = (grade: string) => {
    return `Nivå ${grade}`;
  };

  // Convert positions to readable format
  const formatPosition = (position: string) => {
    if (position === 'TRÄNARE') return 'Tränare';
    
    let formattedPosition = position
      .replace('MV', 'Målvakt')
      .replace('BACK', 'Back')
      .replace('MF', 'Mittfält')
      .replace('ANF', 'Anfall');
    
    return formattedPosition;
  };

  // Format positions array to readable string
  const formatPositions = (positions?: PlayerPosition[]) => {
    if (!positions || positions.length === 0) return "Ingen position definierad";
    
    return positions.map(formatPosition).join(", ");
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSave = (updatedPlayer: Player) => {
    setCurrentPlayer(updatedPlayer);
    setIsEditing(false);
    if (onPlayerUpdate) {
      onPlayerUpdate(updatedPlayer);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // Check if the player is a trainer
  const isTrainer = currentPlayer.positions?.includes('TRÄNARE');
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE');
  };
  
  return (
    <Card className="w-full lg:max-w-3xl mx-auto">
      {isEditing ? (
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold mb-4">Redigera spelare</h2>
          <EditPlayerForm 
            player={currentPlayer} 
            onSave={handleSave} 
            onCancel={handleCancel} 
          />
        </CardContent>
      ) : (
        <>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex gap-4 items-center">
                <div className="flex-shrink-0">
                  {currentPlayer.image ? (
                    <img 
                      src={currentPlayer.image} 
                      alt={currentPlayer.name} 
                      className="h-20 w-20 rounded-full object-cover"
                      loading="lazy"
                      crossOrigin="anonymous" // Adding this to help with CORS issues
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserCircle className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <CardTitle className="text-2xl mb-1 flex items-center">
                    {currentPlayer.name}
                    {currentPlayer.jerseyNumber && (
                      <span className="ml-2 text-sm bg-gray-200 text-gray-800 px-2 py-1 rounded-full">
                        #{currentPlayer.jerseyNumber}
                      </span>
                    )}
                    {isTrainer ? (
                      <Badge className="ml-3 bg-gray-500">
                        Tränare
                      </Badge>
                    ) : (
                      <Badge className={`ml-3 ${getGradeColor(currentPlayer.grade)}`}>
                        {getGradeText(currentPlayer.grade)}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Positioner: {formatPositions(currentPlayer.positions)}
                  </CardDescription>
                  <CardDescription className="mt-1">
                    {playerActivities.length > 0 
                      ? `Deltar i ${playerActivities.length} aktiviteter`
                      : "Deltar inte i några aktiviteter"}
                  </CardDescription>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" onClick={handleEditClick}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "activities" | "statistics")}>
              <TabsList className="mb-4 grid grid-cols-2">
                <TabsTrigger value="activities" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Aktiviteter
                </TabsTrigger>
                <TabsTrigger value="statistics" className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" />
                  Statistik
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="activities">
                <h3 className="text-lg font-semibold">Aktiviteter</h3>
                <ActivityList 
                  activities={playerActivities} 
                  players={allPlayers.length > 0 ? allPlayers : [currentPlayer]} 
                />
              </TabsContent>
              
              <TabsContent value="statistics" className="space-y-4">
                {/* Player performance summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="border rounded-md p-3 text-center">
                    <div className="text-3xl font-bold">{playerStats.totalMatches}</div>
                    <div className="text-sm text-muted-foreground">Matcher</div>
                  </div>
                  <div className="border rounded-md p-3 text-center">
                    <div className="text-3xl font-bold text-green-600">{playerStats.totalGoals}</div>
                    <div className="text-sm text-muted-foreground">Mål</div>
                  </div>
                  <div className="border rounded-md p-3 text-center">
                    <div className="text-3xl font-bold text-blue-600">{playerStats.totalAssists}</div>
                    <div className="text-sm text-muted-foreground">Assist</div>
                  </div>
                </div>
                
                <Separator />
                
                {playerStats.totalGoals > 0 || playerStats.totalAssists > 0 ? (
                  <div className="space-y-4">
                    {/* Goals by activity */}
                    {playerStats.goalsByActivity.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center">
                          <Award className="h-4 w-4 mr-2 text-green-500" />
                          Mål per match
                        </h4>
                        <div className="space-y-2">
                          {playerStats.goalsByActivity.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center px-3 py-2 border rounded-md">
                              <div>
                                <div className="font-medium">{item.activityName}</div>
                                <div className="text-sm text-muted-foreground">{formatDate(item.activityDate)}</div>
                              </div>
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                {item.goals} {item.goals === 1 ? "mål" : "mål"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Assists by activity */}
                    {playerStats.assistsByActivity.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center">
                          <Award className="h-4 w-4 mr-2 text-blue-500" />
                          Assist per match
                        </h4>
                        <div className="space-y-2">
                          {playerStats.assistsByActivity.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center px-3 py-2 border rounded-md">
                              <div>
                                <div className="font-medium">{item.activityName}</div>
                                <div className="text-sm text-muted-foreground">{formatDate(item.activityDate)}</div>
                              </div>
                              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                {item.assists} {item.assists === 1 ? "assist" : "assist"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Ingen statistik tillgänglig för denna spelare än.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" onClick={onClose}>Stäng</Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
