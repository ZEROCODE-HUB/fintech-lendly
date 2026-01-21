import { supabase } from './supabase';

// Simple auth listener: logs state changes and redirects from the auth page after sign-in.
export const initAuthListener = () => {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('[session] auth state change', { event, session });
    try {
      if (event === 'SIGNED_IN') {
        console.log('[session] SIGNED_IN — checking role and redirecting if on /auth', window.location.pathname);
        if (window.location.pathname === '/auth') {
          try {
            // fetch role from public.users (supabase row linked to auth.users)
            const userId = session?.user?.id;
            if (userId) {
              supabase
                .from('users')
                .select('role')
                .eq('id', userId)
                .limit(1)
                .maybeSingle()
                .then(({ data, error }) => {
                  if (error) throw error;
                  const role = data?.role ?? 'client';
                  console.log('[session] fetched user role from public.users', { userId, role, raw: data });
                  const dest = role === 'admin' ? '/admin/dashboard' : '/dashboard';
                  console.log('[session] redirect destination based on role', { role, dest });
                  try { window.location.replace(dest); } catch { window.location.href = dest; }
                })
                .catch((err) => {
                  console.warn('[session] failed to fetch user role, falling back to /dashboard', err);
                  try { window.location.replace('/dashboard'); } catch { window.location.href = '/dashboard'; }
                });
            } else {
              try { window.location.replace('/dashboard'); } catch { window.location.href = '/dashboard'; }
            }
          } catch (err) {
            console.warn('[session] redirect error', err);
            try { window.location.replace('/dashboard'); } catch { window.location.href = '/dashboard'; }
          }
        }
      }
    } catch (err) {
      console.warn('[session] auth handler error', err);
    }
  });
};

export const signOut = async () => {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.warn('[session] signOut failed', e);
  } finally {
    try { localStorage.removeItem('increscendo_user'); } catch { };
    try { localStorage.removeItem('increscendo_session'); } catch { };
    console.log('[session] cleared local session and profile');
  }
};
