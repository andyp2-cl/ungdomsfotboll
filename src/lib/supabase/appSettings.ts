
import { supabase } from './client';

export const getAppSetting = async (key: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('setting_value')
      .eq('setting_key', key)
      .single();

    if (error) {
      console.error('Error fetching app setting:', error);
      return null;
    }

    return data?.setting_value || null;
  } catch (error) {
    console.error('Error in getAppSetting:', error);
    return null;
  }
};

export const setAppSetting = async (key: string, value: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('app_settings')
      .upsert({ 
        setting_key: key, 
        setting_value: value 
      }, { 
        onConflict: 'setting_key' 
      });

    if (error) {
      console.error('Error setting app setting:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in setAppSetting:', error);
    return false;
  }
};
