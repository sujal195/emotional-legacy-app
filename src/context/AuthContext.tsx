import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { setupAdminNotifications } from '@/lib/adminNotifications';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// List of routes that don't require authentication
const publicRoutes = ['/', '/signin', '/signup', '/forgot-password'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const sendNotification = async (type: 'signin' | 'signup' | 'activity', user: User, details?: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-notification', {
        body: { type, user, details }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const trackUserActivity = async (type: 'signin' | 'signout', userId: string) => {
    try {
      const timestamp = new Date().toISOString();
      const { error } = await supabase
        .from('user_activity')
        .insert({
          user_id: userId,
          activity_type: type,
          timestamp
        });

      if (error) throw error;

      if (user) {
        await sendNotification('activity', user, `User ${type === 'signin' ? 'signed in' : 'signed out'}`);
      }
    } catch (error) {
      console.error('Error tracking user activity:', error);
    }
  };

  const checkProfileSetup = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, bio, avatar_url')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      if (!profile || !profile.full_name || !profile.bio) {
        navigate('/profile-setup');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking profile:', error);
      return false;
    }
  };

  useEffect(() => {
    console.log("Setting up auth state listener");
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setTimeout(async () => {
          console.log('User signed in, tracking activity');
          await trackUserActivity('signin', session.user.id);
          
          const isProfileComplete = await checkProfileSetup(session.user.id);
          
          if (location.pathname === '/signin' || location.pathname === '/signup') {
            if (isProfileComplete) {
              console.log('Redirecting to dashboard after sign in');
              navigate('/dashboard');
            } else {
              console.log('Redirecting to profile setup');
              navigate('/profile-setup');
            }
          }
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Got existing session:", session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        setTimeout(async () => {
          await checkProfileSetup(session.user.id);
        }, 0);
      }
    });

    const adminEmail = 'sujalgiri574@gmail.com';
    const channel = setupAdminNotifications(adminEmail);

    return () => {
      supabase.removeChannel(channel);
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  useEffect(() => {
    const checkAuth = async () => {
      if (loading) return;
      
      const isPublicRoute = publicRoutes.includes(location.pathname);
      const isSetupRoute = location.pathname === '/profile-setup';
      
      if (!session && !isPublicRoute) {
        navigate('/signin', { replace: true });
        toast({
          title: "Authentication required",
          description: "Please sign in to access this page.",
        });
      } else if (session && isSetupRoute) {
        return;
      }
    };
    
    checkAuth();
  }, [session, loading, location.pathname, navigate, toast]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }

      if (data.user) {
        await trackUserActivity('signin', data.user.id);
        await sendNotification('signin', data.user);
        
        await checkProfileSetup(data.user.id);
      }
      
      toast({
        title: "Success!",
        description: "You've successfully signed in.",
      });
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message || "An error occurred during sign in.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const { error, data } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        throw error;
      }

      if (data.user) {
        await sendNotification('signup', data.user);
      }
      
      if (data.user?.id) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: data.user.id,
              full_name: name,
              email: email,
            }
          ]);
          
        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }
      
      const isEmailConfirmationRequired = data.session === null && data.user !== null;
      
      if (isEmailConfirmationRequired) {
        toast({
          title: "Account created!",
          description: "Please check your email to confirm your account before signing in.",
        });
        navigate('/signin');
      } else {
        toast({
          title: "Account created!",
          description: "You've been successfully signed up and logged in.",
        });
        navigate('/profile-setup');
      }
    } catch (error: any) {
      let errorMessage = "An error occurred during sign up.";
      
      if (error.message.includes("User already registered")) {
        errorMessage = "This email is already registered. Please sign in instead.";
      } else if (error.message.includes("Password should be")) {
        errorMessage = error.message;
      } else if (error.message.includes("Invalid email")) {
        errorMessage = "Please enter a valid email address.";
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      toast({
        title: "Error signing up",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      if (user) {
        await trackUserActivity('signout', user.id);
      }
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message || "An error occurred during sign out.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
