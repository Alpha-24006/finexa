import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

// A flag to check if we are using the mock local storage database
export const isUsingMock = !supabaseUrl || !supabaseAnonKey || supabaseUrl === 'YOUR_SUPABASE_URL';

if (isUsingMock) {
  console.warn(
    'Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are missing. ' +
    'Running in Mock/Local Storage fallback mode.'
  );
}

export const supabase = isUsingMock ? null : createClient(supabaseUrl, supabaseAnonKey);
