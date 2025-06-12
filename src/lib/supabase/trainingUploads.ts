
import { supabase } from './client';

export interface TrainingUpload {
  id: string;
  filename: string;
  upload_date: string;
  stats_data: any;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

export const saveTrainingUpload = async (filename: string, statsData: any[]) => {
  const { data, error } = await supabase
    .from('training_uploads')
    .insert({
      filename,
      stats_data: statsData,
      uploaded_by: 'user' // Kan uppdateras med auth när det implementeras
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving training upload:', error);
    throw error;
  }

  return data;
};

export const getLatestTrainingUpload = async (): Promise<TrainingUpload | null> => {
  const { data, error } = await supabase
    .from('training_uploads')
    .select('*')
    .order('upload_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching training upload:', error);
    throw error;
  }

  return data;
};

export const getAllTrainingUploads = async (): Promise<TrainingUpload[]> => {
  const { data, error } = await supabase
    .from('training_uploads')
    .select('*')
    .order('upload_date', { ascending: false });

  if (error) {
    console.error('Error fetching training uploads:', error);
    throw error;
  }

  return data || [];
};
