
import { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole, AuthContextType } from './types';
import { fetchUserProfile, loginUser, signUpUser, logoutUser } from './authUtils';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    let initializing = true;
    let unsubscribed = false;

    const safeSetUser = (u: User | null) => {
      if (mounted) setUser(u);
    };
    const safeSetLoading = (l: boolean) => {
      if (mounted) setIsLoading(l);
    };
    const safeSetInitialized = (i: boolean) => {
      if (mounted) setInitialized(i);
    };

    const checkSession = async () => {
      console.log('AuthProvider: Checking for existing session');
      safeSetLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session check error:', error);
          throw error;
        }
        if (session) {
          console.log('Active session found, fetching user profile');
          try {
            const userProfile = await fetchUserProfile(session);
            console.log('User profile loaded:', userProfile);
            if (userProfile) {
              safeSetUser(userProfile);
            } else {
              console.warn('No user profile could be loaded, logging out');
              await supabase.auth.signOut();
              safeSetUser(null);
            }
          } catch (profileError) {
            console.error('Error loading user profile:', profileError);
            toast.error('Failed to load your profile');
            safeSetUser(null);
          }
        } else {
          console.log('No active session found');
          safeSetUser(null);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        safeSetUser(null);
      } finally {
        safeSetLoading(false);
        safeSetInitialized(true);
        initializing = false;
      }
    };

    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!initialized && initializing) {
          // Ignore auth state changes until initial session check is done
          return;
        }
        if (unsubscribed) return;
        console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
        if (session) {
          safeSetLoading(true);
          try {
            const userProfile = await fetchUserProfile(session);
            console.log('User profile from auth change:', userProfile);
            if (userProfile) {
              safeSetUser(userProfile);
              if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && 
                  window.location.pathname === '/login') {
                setTimeout(() => {
                  if (mounted) navigate('/dashboard');
                }, 200);
              }
            } else {
              console.warn('No user profile could be loaded on auth change');
              safeSetUser(null);
            }
          } catch (error) {
            console.error('Error fetching user profile on auth change:', error);
            toast.error('Error loading your profile');
            safeSetUser(null);
          } finally {
            safeSetLoading(false);
          }
        } else {
          console.log('No session in auth change event, clearing user');
          safeSetUser(null);
          safeSetLoading(false);
        }
      }
    );

    checkSession();

    return () => {
      mounted = false;
      unsubscribed = true;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting login for:', email);
      const data = await loginUser(email, password);
      if (data.session) {
        console.log('Login successful, fetching user profile');
        try {
          const userProfile = await fetchUserProfile(data.session);
          if (userProfile) {
            console.log('User profile loaded after login:', userProfile);
            setUser(userProfile);
            toast.success('Login successful');
            setTimeout(() => {
              navigate('/dashboard');
            }, 300);
          } else {
            throw new Error('Failed to load user profile');
          }
        } catch (profileError) {
          console.error('Error loading profile after login:', profileError);
          toast.error('Login successful but failed to load profile');
          setTimeout(() => {
            navigate('/dashboard');
          }, 300);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
      console.error('Login error:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    setIsLoading(true);
    try {
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

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
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
