
import { supabase } from './client';

// Function to log database changes for auditing
export const logDatabaseChange = async (
  action: 'create' | 'update' | 'delete' | 'backup' | 'restore',
  entityType: string,
  entityId: string,
  details?: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('database_logs')
      .insert({
        action,
        entity_type: entityType,
        entity_id: entityId,
        details
      });
      
    if (error) {
      console.error('Error logging database change:', error);
    }
  } catch (error) {
    console.error('Error in logDatabaseChange:', error);
  }
};

// Function to fetch the most recent database logs
export const fetchDatabaseLogs = async (limit = 100) => {
  try {
    const { data, error } = await supabase
      .from('database_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching database logs:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error in fetchDatabaseLogs:', error);
    return [];
  }
};
