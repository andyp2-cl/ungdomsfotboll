
-- Skapa tabell för träningsstatistik upload
CREATE TABLE IF NOT EXISTS public.training_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  stats_data JSONB NOT NULL,
  uploaded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Skapa trigger för att uppdatera updated_at
CREATE OR REPLACE TRIGGER update_training_uploads_updated_at
  BEFORE UPDATE ON public.training_uploads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Lägg till RLS (Row Level Security) 
ALTER TABLE public.training_uploads ENABLE ROW LEVEL SECURITY;

-- Skapa policy för att alla kan läsa träningsdata
CREATE POLICY "Anyone can read training uploads" 
  ON public.training_uploads 
  FOR SELECT 
  USING (true);

-- Skapa policy för att alla kan skapa träningsdata
CREATE POLICY "Anyone can create training uploads" 
  ON public.training_uploads 
  FOR INSERT 
  WITH CHECK (true);

-- Skapa policy för att alla kan uppdatera träningsdata
CREATE POLICY "Anyone can update training uploads" 
  ON public.training_uploads 
  FOR UPDATE 
  USING (true);

-- Skapa policy för att alla kan ta bort träningsdata
CREATE POLICY "Anyone can delete training uploads" 
  ON public.training_uploads 
  FOR DELETE 
  USING (true);
