import { supabase } from './supabase';

// Simple auth listener: logs state changes and redirects from the auth page after sign-in.
export const initAuthListener = () => {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('[session] auth state change', { event, session });
    try {
      if (event === 'SIGNED_IN') {
        console.log('[session] SIGNED_IN — redirecting if on /auth', window.location.pathname);
        if (window.location.pathname === '/auth') {
          try { window.location.replace('/usuario-nuevo-marketing'); } catch { window.location.href = '/usuario-nuevo-marketing'; }
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
