
import { supabase } from './client';

// Define valid action types with all the values we're using
type LogAction = 'create' | 'update' | 'delete' | 'backup' | 'restore' | 'error' | 'warning';

/**
 * Logs changes to the database for audit purposes
 * 
 * @param action The action performed (create, update, delete, backup, restore, error, warning)
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
    // Try to log the change, but don't throw if there's an error
    const { error } = await supabase
      .from('database_logs')
      .insert({
        action,
        entity_type: entityType,
        entity_id: entityId,
        details
      });
    
    if (error) {
      // Log to console but don't throw - this is a non-critical operation
      console.error('Error logging database change (continuing anyway):', error);
    }
  } catch (error) {
    // Also log any exceptions but don't throw - this is a non-critical operation
    console.error('Exception in logDatabaseChange (continuing anyway):', error);
  }
};
