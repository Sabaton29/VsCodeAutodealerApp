/**
 * Authentication utilities for Autodealer Cloud
 * 
 * Este módulo proporciona funciones helper para autenticación con Supabase.
 */

import { supabase } from './supabase';
import { UserRole } from '../types';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  role?: UserRole;
  locationId?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

/**
 * Registrar un nuevo usuario
 */
export async function signUp({ email, password, fullName, role, locationId }: SignUpData) {
  try {
    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role || UserRole.MECANICO,
        },
      },
    });

    if (authError) throw authError;

    if (!authData.user) {
      throw new Error('Failed to create user');
    }

    // 2. Crear perfil en la tabla staff_members
    const { error: profileError } = await supabase
      .from('staff_members')
      .insert({
        id: authData.user.id,
        email: email,
        name: fullName,
        role: role || UserRole.MECANICO,
        location_id: locationId || 'L1',
        avatar_url: `https://i.pravatar.cc/48?u=${authData.user.id}`,
        document_type: 'Cédula de Ciudadanía',
        document_number: '',
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Si falla la creación del perfil, intentar eliminar el usuario de auth
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error('Failed to create user profile');
    }

    return { user: authData.user, session: authData.session };
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
}

/**
 * Iniciar sesión
 */
export async function signIn({ email, password }: SignInData) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { user: data.user, session: data.session };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

/**
 * Cerrar sesión
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

/**
 * Restablecer contraseña (enviar email)
 */
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
}

/**
 * Actualizar contraseña
 */
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Update password error:', error);
    throw error;
  }
}

/**
 * Obtener el perfil del usuario actual
 */
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('staff_members')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Get user profile error:', error);
    throw error;
  }
}

/**
 * Verificar si el usuario tiene un permiso específico
 */
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) return false;

    // TODO: Implementar lógica de permisos basada en rol y permisos personalizados
    return true;
  } catch (error) {
    console.error('Check permission error:', error);
    return false;
  }
}







