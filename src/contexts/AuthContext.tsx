
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

// Define user types
export type UserRole = 'admin' | 'client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      
      try {
        // Check for an active session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session) {
          await fetchUserProfile(session);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          await fetchUserProfile(session);
        } else {
          setUser(null);
        }
      }
    );
    
    checkSession();
    
    // Cleanup the subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Function to fetch user profile
  const fetchUserProfile = async (session: Session) => {
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
        // Combine the name from first_name and last_name or use default values
        const name = data.first_name && data.last_name 
          ? `${data.first_name} ${data.last_name}` 
          : (data.first_name || 'User');
        
        setUser({
          id: userId,
          email: email,
          name: name,
          role: (data.role?.toLowerCase() as UserRole) || 'client'
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data.session) {
        toast.success('Login successful');
        navigate('/dashboard');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    setIsLoading(true);
    
    try {
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
      
      toast.success('Registration successful! Check your email to confirm your account.');
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Clear user data
      setUser(null);
      
      // Show success message and redirect to login
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      toast.error(message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, signUp }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
