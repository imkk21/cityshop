import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace these with your Supabase project URL and anon key
const SUPABASE_URL = 'https://nbzuqafgapyfiqjjrsts.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ienVxYWZnYXB5Zmlxampyc3RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NTkzODMsImV4cCI6MjA1MTAzNTM4M30.xc2iEdYGO6Rgw_50B23k44Zo2t-QUNk1psQWWHoCh8o';

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
