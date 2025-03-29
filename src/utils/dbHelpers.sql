
-- This file is just for documentation purposes, the function will be created directly in the database
-- Create a stored procedure that can bypass RLS to insert logs
CREATE OR REPLACE FUNCTION public.insert_database_log(
  action_param TEXT,
  entity_type_param TEXT,
  entity_id_param TEXT,
  details_param TEXT
) RETURNS void AS $$
BEGIN
  INSERT INTO public.database_logs 
    (action, entity_type, entity_id, details)
  VALUES 
    (action_param, entity_type_param, entity_id_param, details_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
