import { supabase } from './supabase';

export const signOut = async () => {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.warn('[session] signOut failed', e);
  } finally {
    localStorage.removeItem('increscendo_user');
    localStorage.removeItem('increscendo_session');
    localStorage.removeItem('testUserRole');
    console.log('[session] cleared local session');
  }
};

export const initAuthListener = () => {
  console.log('[session] initAuthListener - deprecated, use AuthContext instead');
};