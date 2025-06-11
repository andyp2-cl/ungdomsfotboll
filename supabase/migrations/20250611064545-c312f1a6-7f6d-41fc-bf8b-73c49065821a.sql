
-- Skapa tabell för träningsstatistik
CREATE TABLE public.training_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id TEXT NOT NULL,
  training_date DATE NOT NULL,
  training_type TEXT,
  attendance BOOLEAN NOT NULL DEFAULT true,
  performance_score INTEGER CHECK (performance_score >= 1 AND performance_score <= 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Skapa index för bättre prestanda
CREATE INDEX idx_training_stats_player_id ON public.training_stats(player_id);
CREATE INDEX idx_training_stats_date ON public.training_stats(training_date);

-- Skapa trigger för updated_at
CREATE TRIGGER update_training_stats_updated_at 
  BEFORE UPDATE ON public.training_stats 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
