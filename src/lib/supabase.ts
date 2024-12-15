import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../config/supabase';

if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.key) {
  throw new Error('Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);