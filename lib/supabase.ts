/**
 * Supabase Client Configuration
 * 
 * Este archivo configura el cliente de Supabase para la aplicación.
 * Asegúrate de tener las variables de entorno configuradas correctamente.
 */

import { createClient } from '@supabase/supabase-js';

// Validar que las variables de entorno estén configuradas
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.\n' +
    'Required variables:\n' +
    '  - VITE_SUPABASE_URL\n' +
    '  - VITE_SUPABASE_ANON_KEY',
  );
}

/**
 * Cliente de Supabase - Singleton
 * 
 * Este cliente se usa para todas las operaciones de Supabase en el frontend.
 * Incluye autenticación, base de datos, y storage.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persistir la sesión en localStorage
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'autodealer-auth-token',
  },
  // Configuración de realtime (opcional)
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

/**
 * Tipos de datos de la base de datos
 * 
 * TODO: Generar tipos automáticamente con:
 * npx supabase gen types typescript --project-id your-project-id > lib/database.types.ts
 */
export type Database = {
  public: {
    Tables: {
      // Aquí irán los tipos generados automáticamente
      // Por ahora dejamos un placeholder
      [key: string]: any;
    };
  };
};

/**
 * Helper: Verificar si el usuario está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

/**
 * Helper: Obtener el usuario actual
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  return user;
}

/**
 * Helper: Obtener la sesión actual
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return session;
}

/**
 * Helper: Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

export default supabase;







