import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  getUserRole: (userId: string) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);

        // Handle new user or sign in - create profile if doesn't exist
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          console.log('User signed in, checking profile...');
          setTimeout(async () => {
            // Check if profile exists
            const { data: profile } = await supabase
              .from('profiles')
              .select('is_blocked')
              .eq('user_id', session.user.id)
              .maybeSingle();

            // If no profile exists (e.g., Google OAuth user), create one
            if (!profile) {
              const userMeta = session.user.user_metadata;
              await supabase.from('profiles').upsert({
                user_id: session.user.id,
                email: session.user.email,
                full_name: userMeta?.full_name || userMeta?.name || session.user.email?.split('@')[0] || 'User',
                role: 'user',
                is_blocked: false,
              }, { onConflict: 'user_id' });
            } else if (profile?.is_blocked) {
              await supabase.auth.signOut();
            }
          }, 0);
        }

        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/auth`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });

    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Map common errors to Thai messages
      if (error.message?.includes('Invalid login credentials')) {
        return { error: { message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' } };
      }
      if (error.message?.includes('Email not confirmed')) {
        return { error: { message: 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ' } };
      }
      return { error };
    }

    if (data.user) {
      return checkUserBlocked(data.user);
    }

    return { error: null };
  };

  const checkUserBlocked = async (user: User) => {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_blocked, blocked_reason')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error checking user status:', profileError);
    }

    if (profile?.is_blocked) {
      await supabase.auth.signOut();
      return {
        error: {
          message: 'บัญชีของคุณถูกระงับ กรุณาติดต่อผู้ดูแลระบบ',
          code: 'user_blocked'
        }
      };
    }
    return { error: null };
  };

  const getUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }

    return data?.role || 'user';
  };

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    
    if (error) {
      console.error('Google OAuth error:', error);
    }
    
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth?tab=reset`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    getUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};