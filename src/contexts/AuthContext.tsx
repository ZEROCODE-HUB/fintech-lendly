import React, { createContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type UserRole = 'admin' | 'client';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isRoleLoading: boolean;
  isAdmin: boolean;
  userRole: UserRole | null;
  userId: string | null;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRoleLoading, setIsRoleLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const roleFetchedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isLoadingRef = useRef(true);

  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      if (data?.role) {
        setUserRole(data.role as UserRole);
      }
    } catch {
      setUserRole(null);
    } finally {
      setIsRoleLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    isLoadingRef.current = true;

    const initAuth = async () => {
      timeoutRef.current = setTimeout(() => {
        if (mounted && isLoadingRef.current) {
          isLoadingRef.current = false;
          setIsLoading(false);
          setIsRoleLoading(false);
        }
      }, 4000);

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        clearTimeout(timeoutRef.current);
        isLoadingRef.current = false;
        
        if (error) {
          console.warn('Auth session error:', error.message);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);

        if (session?.user?.id && !roleFetchedRef.current) {
          roleFetchedRef.current = true;
          fetchUserRole(session.user.id);
        } else {
          setIsRoleLoading(false);
        }
      } catch (error) {
        console.error('Auth init error:', error);
        if (mounted) {
          clearTimeout(timeoutRef.current);
          isLoadingRef.current = false;
          setIsLoading(false);
          setIsRoleLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        clearTimeout(timeoutRef.current);
        isLoadingRef.current = false;
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        if (event === 'SIGNED_IN' && session?.user?.id) {
          roleFetchedRef.current = true;
          fetchUserRole(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          roleFetchedRef.current = false;
          setUserRole(null);
          setIsRoleLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      subscription.unsubscribe();
    };
  }, [fetchUserRole]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('increscendo_user');
      localStorage.removeItem('testUserRole');
      setUser(null);
      setSession(null);
      setUserRole(null);
      roleFetchedRef.current = false;
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    session,
    isLoading,
    isRoleLoading,
    isAdmin: userRole === 'admin',
    userRole,
    userId: user?.id ?? null,
    signOut,
  }), [user, session, isLoading, isRoleLoading, userRole, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};