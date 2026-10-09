import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.https://vgkczlxbpzacturfeyof.supabase.co/rest/v1/;
const supabaseAnonKey = process.env.sb_publishable_ZfFSnOi2HJjelWssDrgA2g_-U2c5tdI;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
