
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, CheckCircle, Calendar as CalendarClock } from "lucide-react";
import { Activity } from "@/types/player";
import { getStoredActivities } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import { LoadingState } from "@/components/LoadingState";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function CalendarPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load activities from storage
  useEffect(() => {
    const loadActivities = async () => {
      try {
        const storedActivities = await getStoredActivities();
        setActivities(storedActivities);
      } catch (error) {
        console.error("Error loading activities:", error);
        toast({
          title: "Kunde inte ladda aktiviteter",
          description: "Ett fel uppstod när aktiviteter skulle hämtas.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();
  }, [toast]);

  // Format date to YYYY-MM-DD for comparing with activity dates
  const formatDateForComparison = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  };

  // Find activities for selected date
  const getActivitiesForSelectedDate = () => {
    if (!selectedDate) return [];
    const formattedDate = formatDateForComparison(selectedDate);
    return activities.filter(activity => activity.date === formattedDate);
  };

  // Create a map of dates with activities for highlighting in the calendar
  const getDatesWithActivities = () => {
    const dates = new Set<string>();
    activities.forEach(activity => {
      dates.add(activity.date);
    });
    return dates;
  };

  // Custom modifiers for calendar display
  const datesWithActivities = getDatesWithActivities();
  const isDateWithActivity = (date: Date) => {
    return datesWithActivities.has(formatDateForComparison(date));
  };

  // Activities for the selected date
  const selectedDateActivities = getActivitiesForSelectedDate();

  // Navigate to activity details page
  const handleActivityClick = (activity: Activity) => {
    navigate("/activities", { state: { selectedActivityId: activity.id } });
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarClock className="h-6 w-6" />
          Aktivitetskalender
        </h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Tillbaka
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Kalender
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="p-3 pointer-events-auto"
              modifiers={{ hasActivity: isDateWithActivity }}
              modifiersStyles={{
                hasActivity: {
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  borderRadius: '0',
                }
              }}
              showOutsideDays
            />
            <div className="mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-100 rounded-sm"></div>
                <span>Dagar med aktiviteter</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedDate ? (
                <>Aktiviteter {format(selectedDate, 'yyyy-MM-dd')}</>
              ) : (
                <>Välj ett datum</>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateActivities.length > 0 ? (
              <div className="space-y-4">
                {selectedDateActivities.map(activity => (
                  <div
                    key={activity.id}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleActivityClick(activity)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-medium">{activity.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {activity.time && (
                            <span className="flex items-center gap-1">
                              <CalendarClock className="h-3.5 w-3.5" />
                              {activity.time}
                            </span>
                          )}
                          {activity.location?.name && (
                            <span>• {activity.location.name}</span>
                          )}
                        </div>
                      </div>
                      <Badge variant={activity.type === 'match' ? 'default' : 'secondary'}>
                        {activity.type === 'match' ? 'Match' : 'Cup'}
                      </Badge>
                    </div>
                    {activity.participants && activity.participants.length > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>{activity.participants.length} deltagare</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {selectedDate ? (
                  <p>Inga aktiviteter planerade denna dag</p>
                ) : (
                  <p>Välj ett datum för att se aktiviteter</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
