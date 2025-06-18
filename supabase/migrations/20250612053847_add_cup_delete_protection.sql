-- Create a function to check if a cup has matches before deletion
CREATE OR REPLACE FUNCTION check_cup_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is a cup and if it has any matches
  IF OLD.type = 'cup' AND EXISTS (
    SELECT 1 FROM activities
    WHERE cup_id = OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete cup that has linked matches. Please unlink or delete the matches first.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS prevent_cup_deletion_with_matches ON activities;
CREATE TRIGGER prevent_cup_deletion_with_matches
  BEFORE DELETE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION check_cup_deletion(); 