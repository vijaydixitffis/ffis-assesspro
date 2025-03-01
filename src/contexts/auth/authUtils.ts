
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from './types';
import { Session } from '@supabase/supabase-js';

/**
 * Fetches user profile information from Supabase
 */
export const fetchUserProfile = async (session: Session): Promise<User | null> => {
  const userId = session.user.id;
  
  try {
    // First, get the user email directly from the session
    const email = session.user.email || '';
    
    // Then query the profiles table for additional user information
    const { data, error } = await supabase
      .from('profiles')
      .select('first_name, last_name, role')
      .eq('id', userId)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (data) {
      // Store first_name and last_name directly
      const firstName = data.first_name || '';
      const lastName = data.last_name || '';
      
      // Also construct the full name for backward compatibility
      const name = firstName && lastName 
        ? `${firstName} ${lastName}` 
        : (firstName || lastName || 'User');
      
      return {
        id: userId,
        email: email,
        name: name,
        firstName: firstName,
        lastName: lastName,
        role: (data.role?.toLowerCase() as UserRole) || 'client'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Logs in a user with email and password
 */
export const loginUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
};

/**
 * Signs up a new user
 */
export const signUpUser = async (
  email: string, 
  password: string, 
  name: string, 
  role: UserRole
) => {
  // Split the name into first_name and last_name
  const nameParts = name.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        role: role.toUpperCase()
      }
    }
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
};

/**
 * Logs out the current user
 */
export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw error;
  }
  
  return true;
};
