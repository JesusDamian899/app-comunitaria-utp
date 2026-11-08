import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Valores por defecto incluidos para que funcione al clonar o desplegar sin requerir .env manual
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://rbldfilrlaslncwwodxn.supabase.co';

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_TztUFLPRA_BsvSgub-vGtQ_e9h_Bni0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
