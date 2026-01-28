import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || Deno.env.get("NEXT_PUBLIC_SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabaseAdmin = createClient(SUPABASE_URL as string, SUPABASE_SERVICE_ROLE_KEY as string, {
  auth: { persistSession: false },
});

const CORS_HEADERS = new Headers({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
  'Access-Control-Allow-Credentials': 'true',
});

serve(async (req) => {
  try {
    // Handle preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: CORS_HEADERS });
    }

    const body = await req.json();

    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      address,
      birth_date,
      curp,
      ine_key,
      role,
    } = body as Record<string, any>;

    if (!email) return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400, headers: CORS_HEADERS });

    // Create auth user via admin API
    const { data: createData, error: createError } = await (supabaseAdmin.auth as any).admin.createUser({
      email,
      password: password || undefined,
      user_metadata: { first_name, last_name, phone, address, birth_date, curp, ine_key },
    });

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message || createError }), { status: 400, headers: CORS_HEADERS });
    }

    const user = (createData && (createData.user || createData)) || null;
    const userId = user?.id || null;

    // Upsert profile in 'users' table
    const profilePayload: any = {
      id: userId,
      email,
      first_name,
      last_name,
      phone,
      address,
      birth_date: birth_date || null,
      curp,
      ine_key,
      role,
    };

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .upsert(profilePayload, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (profileError) {
      return new Response(JSON.stringify({ error: profileError.message || profileError }), { status: 500, headers: CORS_HEADERS });
    }

    return new Response(JSON.stringify({ user, profile }), { status: 200, headers: CORS_HEADERS });
  } catch (err) {
    console.error('Exception in create-user function', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: CORS_HEADERS });
  }
});
