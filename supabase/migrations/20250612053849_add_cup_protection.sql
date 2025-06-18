-- Create a function to check if a cup has matches before deletion
CREATE OR REPLACE FUNCTION check_cup_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is a cup and if it has any matches
  IF OLD.type = 'cup' AND EXISTS (
    SELECT 1 FROM activities
    WHERE cup_id = OLD.id
    AND deleted_at IS NULL  -- Only consider non-deleted matches
  ) THEN
    RAISE EXCEPTION 'Kan inte ta bort cupen eftersom den har kopplade matcher. Ta bort eller avlänka matcherna först.';
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