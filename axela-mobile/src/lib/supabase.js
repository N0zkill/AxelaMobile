import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zpybzbudxdznzehulgyx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6cHlienJ1ZHhkem56ZWh1bGd5eCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjgwMDAwMDAwLCJleHAiOjE5OTU1NzYwMDB9.sb_publishable_jubAtV8I0rlrw_6FkIyx9Q_qH-HF8lo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
