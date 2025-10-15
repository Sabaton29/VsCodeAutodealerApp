/**
 * Proveedor de Autenticación para Autodealer Cloud
 * 
 * Este componente maneja la autenticación de usuarios con Supabase
 * y protege las rutas que requieren autenticación.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { StaffMember } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: StaffMember | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<StaffMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = async(userId: string) => {
    try {
      const { data, error } = await supabase
        .from('staff_members')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Mapear nombres de columnas de snake_case a camelCase
      const mappedProfile: StaffMember = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        avatarUrl: data.avatar_url,
        locationId: data.location_id,
        specialty: data.specialty,
        documentType: data.document_type,
        documentNumber: data.document_number,
        customPermissions: data.custom_permissions || [],
        salaryType: data.salary_type,
        salaryAmount: data.salary_amount,
        isProLabore: data.is_pro_labore,
        requiresTimeClock: data.requires_time_clock,
        commissionRate: data.commission_rate,
      };

      setProfile(mappedProfile);
    } catch (error) {
      console.error('Error cargando perfil:', error);
      setProfile(null);
    }
  };

  const refreshProfile = async() => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadProfile(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Escuchar cambios en autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async(_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async(email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signUp = async(email: string, password: string, userData: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    if (error) throw error;

    // Crear perfil en staff_members
    if (data.user) {
      const { error: profileError } = await supabase
        .from('staff_members')
        .insert({
          id: data.user.id,
          email: email,
          name: userData.name || email,
          role: userData.role || 'Mecánico',
          location_id: userData.locationId || 'L1',
          avatar_url: `https://i.pravatar.cc/48?u=${data.user.id}`,
          document_type: userData.documentType || 'Cédula de Ciudadanía',
          document_number: userData.documentNumber || '',
        });

      if (profileError) {
        console.error('Error creando perfil:', profileError);
        throw new Error('Error al crear el perfil de usuario');
      }
    }
  };

  const signOut = async() => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};







