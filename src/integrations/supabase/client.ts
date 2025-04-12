
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Atualizando para o projeto correto: controledeprocessos1oficio
const SUPABASE_URL = "https://hrrwsfqojmgucqzzqozg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhycndzZnFvam1ndWNxenpxb3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NzMxOTgsImV4cCI6MjA2MDA0OTE5OH0.9b6jTqYJ9oQ2iU_S3f-JUAeVyNhAp6jHxSR9kdo1qUo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Estendendo o cliente Supabase com métodos personalizados
const supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});

// Adicionando método getUrl para acessar a URL do Supabase
export const supabase = {
  ...supabaseClient,
  getUrl: () => SUPABASE_URL
};
