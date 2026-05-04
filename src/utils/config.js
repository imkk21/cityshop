// config.js — Environment configuration
// All secrets are loaded from .env via react-native-dotenv
import { SUPABASE_URL, SUPABASE_ANON_KEY, RAZORPAY_KEY, GOOGLE_WEB_CLIENT_ID } from '@env';

export const CONFIG = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  RAZORPAY_KEY,
  GOOGLE_WEB_CLIENT_ID,
};
