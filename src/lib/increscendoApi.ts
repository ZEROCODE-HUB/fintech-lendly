import { supabase } from './supabase';

const INCRESCENDO_API_BASE_URL = 'https://increscendo-api.vercel.app';
// const INCRESCENDO_API_BASE_URL = 'http://localhost:3000';


export const getSupabaseAccessToken = async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        throw error;
    }

    const token = data.session?.access_token;

    if (!token) {
        throw new Error('No active Supabase session');
    }

    return token;
};

export const increscendoApiFetch = async (path: string, init: RequestInit = {}) => {
    const token = await getSupabaseAccessToken();
    const url = path.startsWith('http') ? path : `${INCRESCENDO_API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    const headers = new Headers(init.headers || {});

    if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    return fetch(url, {
        ...init,
        headers,
    });
};