
import { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole, AuthContextType } from './types';
import { fetchUserProfile, loginUser, signUpUser, logoutUser } from './authUtils';

// Create the context with default undefined value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
          const userProfile = await fetchUserProfile(session);
          setUser(userProfile);
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
          const userProfile = await fetchUserProfile(session);
          setUser(userProfile);
          
          // Ensure redirection to dashboard when user profile is set
          if (window.location.pathname === '/login') {
            navigate('/dashboard');
          }
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

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const data = await loginUser(email, password);
      
      if (data.session) {
        const userProfile = await fetchUserProfile(data.session);
        setUser(userProfile);
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

  // Signup function - Available only for admin users to create new accounts
  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    setIsLoading(true);
    
    try {
      // First check if the current user is an admin
      if (!user || user.role !== 'admin') {
        throw new Error('Only administrators can create new user accounts');
      }
      
      await signUpUser(email, password, name, role);
      toast.success('User account created successfully!');
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'User creation failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await logoutUser();
      
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
