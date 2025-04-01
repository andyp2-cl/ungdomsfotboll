
import { supabase } from './client';

// Define valid action types
type LogAction = 'create' | 'update' | 'delete' | 'backup' | 'restore';

/**
 * Logs changes to the database for audit purposes
 * 
 * @param action The action performed (create, update, delete, backup, restore)
 * @param entityType The type of entity modified (player, activity, backup)
 * @param entityId The ID of the entity, or 'all' for bulk operations
 * @param details Optional details about the change
 */
export const logDatabaseChange = async (
  action: LogAction,
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
