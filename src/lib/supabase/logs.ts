
import { supabase } from './client';

// Define the database function parameter types properly
type InsertDatabaseLogParams = {
  action_param: string;
  entity_type_param: string;
  entity_id_param: string;
  details_param: string;
};

// Improved function to log database changes with better error handling for RLS issues
export const logDatabaseChange = async (
  action: 'create' | 'update' | 'delete', 
  entityType: 'player' | 'activity' | 'player_activity',
  entityId: string,
  details: string
): Promise<void> => {
  try {
    console.log(`Logging database change: ${action} ${entityType} ${entityId}`);
    
    // Use the correct type for the parameters
    const params: InsertDatabaseLogParams = {
      action_param: action,
      entity_type_param: entityType,
      entity_id_param: entityId,
      details_param: details
    };
    
    const { error } = await supabase.rpc('insert_database_log', params);
    
    if (error) {
      console.error('Error logging database change (RPC method):', error);
      
      // Fallback to regular insert
      const { error: insertError } = await supabase
        .from('database_logs')
        .insert({
          action,
          entity_type: entityType,
          entity_id: entityId,
          details,
          timestamp: new Date().toISOString()
        });
        
      if (insertError) {
        console.error('Error logging database change (direct insert):', insertError);
      }
    }
  } catch (error) {
    console.error('Unexpected error in logDatabaseChange:', error);
  }
};

// Function to fetch database logs
export const fetchDatabaseLogs = async (limit: number = 100): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('database_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching database logs:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchDatabaseLogs:', error);
    return [];
  }
};
