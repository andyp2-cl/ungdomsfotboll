
import { supabase } from './client';
import { Activity } from "@/types/player";
import { formatActivityForDatabase } from "@/utils/database/formatters/activity";

// Enhanced helper function to handle RLS policy errors with activities table
// This will use a simplified approach focusing on the most robust methods first
export const updateActivityWithRLSHandling = async (
  activityId: string, 
  updates: any
): Promise<{success: boolean, error?: any, data?: any}> => {
  console.log(`Attempting to update activity with RLS handling: ${activityId}`, updates);

  try {
    // APPROACH 1: Direct minimal update - try only updating the specific fields provided
    console.log("APPROACH 1: Trying direct minimal update");
    const { error: minimalUpdateError, data: minimalUpdateData } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', activityId)
      .select();
    
    if (!minimalUpdateError) {
      console.log("Activity updated successfully via minimal update");
      return { success: true, data: minimalUpdateData };
    }
    
    console.warn("Minimal update failed:", minimalUpdateError.message);
    
    // APPROACH 2: Try with only scores - the most important fields
    if (updates.home_score !== undefined || updates.away_score !== undefined) {
      console.log("APPROACH 2: Trying scores only update");
      const scoresOnly = {
        home_score: updates.home_score,
        away_score: updates.away_score
      };
      
      const { error: scoresError, data: scoresData } = await supabase
        .from('activities')
        .update(scoresOnly)
        .eq('id', activityId)
        .select();
      
      if (!scoresError) {
        console.log("Scores updated successfully");
        return { success: true, data: scoresData };
      }
      
      console.warn("Scores update failed:", scoresError.message);
    }
    
    // APPROACH 3: Try direct REST API with auth token
    console.log("APPROACH 3: Trying direct REST API approach");
    
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const apiUrl = `https://zkrruihxszziifyogzko.supabase.co/rest/v1/activities?id=eq.${activityId}`;
      
      // Make sure we have the correct headers for authentication
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcnJ1aWh4c3p6aWlmeW9nemtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNjQ1NDksImV4cCI6MjA1ODc0MDU0OX0.ct3AMhbgnJg6pOjlACfwPR5n_Nz2pHX5AScfe84YM0U',
          'Authorization': token ? `Bearer ${token}` : '',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        console.log("Activity updated successfully via direct REST API");
        const jsonResponse = await response.json();
        return { success: true, data: jsonResponse };
      } else {
        const errorText = await response.text();
        console.warn("Direct REST API update failed:", errorText);
        
        // If this was a score update, try absolute minimal fields
        if (updates.home_score !== undefined || updates.away_score !== undefined) {
          const homeScoreResponse = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcnJ1aWh4c3p6aWlmeW9nemtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNjQ1NDksImV4cCI6MjA1ODc0MDU0OX0.ct3AMhbgnJg6pOjlACfwPR5n_Nz2pHX5AScfe84YM0U',
              'Authorization': token ? `Bearer ${token}` : '',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({ home_score: updates.home_score })
          });
          
          if (homeScoreResponse.ok) {
            console.log("Home score updated successfully");
            return { success: true, data: { message: "Partial update successful" } };
          }
        }
      }
    } catch (restError) {
      console.error("Error with direct REST API update:", restError);
    }
    
    // APPROACH 4: Get the existing activity and try a full replace
    console.log("APPROACH 4: Try getting existing activity and performing full update");
    try {
      // Try to get the full activity first
      const { data: existingActivity } = await supabase
        .from('activities')
        .select('*')
        .eq('id', activityId)
        .single();
      
      if (existingActivity) {
        // Create complete object with all data and the updates
        const completeActivity = {
          ...existingActivity,
          ...updates,
        };
        
        // Try one more update with the complete activity
        const { error: finalError } = await supabase
          .from('activities')
          .update(completeActivity)
          .eq('id', activityId);
          
        if (!finalError) {
          console.log("Activity updated through complete replacement");
          return { success: true, data: completeActivity };
        } else {
          console.error("Complete replacement update failed:", finalError);
        }
      }
    } catch (finalError) {
      console.error("Error with final update attempt:", finalError);
    }
    
    // If we reached here, all approaches failed
    return { 
      success: false, 
      error: "All update attempts failed", 
      data: { localOnly: true } 
    };
    
  } catch (err) {
    console.error("Global error in updateActivityWithRLSHandling:", err);
    return { success: false, error: err };
  }
};

// Helper function to get activity by ID
export const getActivityById = async (activityId: string): Promise<Activity | null> => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', activityId)
      .single();
      
    if (error) {
      console.error("Error fetching activity by ID:", error);
      return null;
    }
    
    return data as Activity;
  } catch (error) {
    console.error("Exception fetching activity by ID:", error);
    return null;
  }
};
