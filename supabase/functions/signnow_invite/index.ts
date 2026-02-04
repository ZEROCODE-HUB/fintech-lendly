export async function handler(request: Request): Promise<Response> {
  try {
    // CORS & helper
    const origin = request.headers.get('origin') || '*';
    const CORS_HEADERS: Record<string, string> = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
      'Access-Control-Allow-Credentials': 'true',
    };

    const json = (obj: any, status = 200) => new Response(JSON.stringify(obj), { status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
    // helper: fetch with timeout (AbortController)
    const fetchWithTimeout = async (url: string, options: any = {}, timeoutMs = 30000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        return res;
      } finally {
        clearTimeout(id);
      }
    };

    const startTime = Date.now();
    const mark = (label: string) => console.log('[signnow_invite] timing', label, `${Date.now() - startTime}ms`);

    console.log('[signnow_invite] incoming request', { method: request.method, headers: Object.fromEntries(request.headers.entries()) });

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method Not Allowed' }, 405);
    }

    const rawBody = await request.text().catch(() => null);
    console.log('[signnow_invite] raw body', rawBody);
    let body: any = {};
    try {
      body = rawBody ? JSON.parse(rawBody) : {};
    } catch (e) {
      console.warn('[signnow_invite] failed to parse JSON body', String(e));
      body = {};
    }
    const recipient_email: string | undefined = body.recipient_email || body.email;
    if (!recipient_email) {
      return json({ error: 'recipient_email is required in body' }, 400);
    }

    // WARNING: API key is embedded directly as requested. This is insecure for public repos.
    const SIGNNOW_API_KEY = '2ba3338382019eac58646001b390a7a976f7a85fde881b44ab63e349c5c0f41d';
    const SIGNNOW_FROM_EMAIL = Deno.env.get('SIGNNOW_FROM_EMAIL') || recipient_email;

    console.log('[signnow_invite] called, recipient:', recipient_email);
    console.log('[signnow_invite] using SIGNNOW_FROM_EMAIL:', SIGNNOW_FROM_EMAIL);

    const uploadUrl = 'https://api.signnow.com/v2/documents/url';
    console.log('[signnow_invite] uploading document to', uploadUrl);
    mark('before-upload');
    let uploadResp: Response;
    try {
      uploadResp = await fetchWithTimeout(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SIGNNOW_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: 'https://www.ensa.com.pa/sites/default/files/modelo_de_carta_de_autorizacion_ns.pdf', check_fields: true }),
      }, 30000);
    } catch (e) {
      console.error('[signnow_invite] upload fetch error', String(e));
      return json({ error: 'Upload fetch error', message: String(e) }, 504);
    }
    mark('after-upload');

    if (!uploadResp.ok) {
      const txt = await uploadResp.text().catch(() => '');
      console.error('[signnow_invite] upload failed', uploadResp.status, txt);
      return json({ error: 'Upload failed', status: uploadResp.status, body: txt }, 502);
    }

    const uploadJson = await uploadResp.json();
    console.log('[signnow_invite] upload response', uploadJson);
    const docId = uploadJson?.id;
    if (!docId) {
      console.error('[signnow_invite] no docId returned', uploadJson);
      return json({ error: 'Document upload did not return id', raw: uploadJson }, 502);
    }

    // Prepare fields payload (from user spec)
    const fieldsPayload = {
      fields: [
        {
          type: 'text',
          required: true,
          role: 'Recipient 1',
          page_number: 0,
          x: 217,
          y: 32,
          width: 50,
          height: 20,
          prefilled_text: 'First name',
          stretch_mode: 'horizontal',
          label: 'First name',
          align: 'center'
        },
        {
          type: 'signature',
          required: true,
          role: 'Recipient 1',
          page_number: 0,
          x: 217,
          y: 32,
          width: 50,
          height: 20,
          allowed_types: ['draw']
        },
        {
          type: 'text',
          required: true,
          role: 'Recipient 1',
          page_number: 0,
          x: 217,
          y: 32,
          width: 50,
          height: 20,
          label: 'Date',
          lock_to_sign_date: false,
          validator_id: '059b068ef8ee5cc27e09ba79af58f9e805b7c2b3'
        },
        {
          type: 'checkbox',
          required: true,
          role: 'Recipient 1',
          page_number: 0,
          x: 217,
          y: 32,
          width: 15,
          height: 15,
          prefilled_text: 1
        },
        {
          type: 'attachment',
          name: 'photo',
          label: 'Your photo',
          required: true,
          role: 'Recipient 1',
          page_number: 0,
          x: 217,
          y: 32,
          width: 15,
          height: 15
        },
        {
          type: 'radiobutton',
          page_number: 0,
          name: 'US residency',
          role: 'Recipient 1',
          required: true,
          x: 389,
          y: 141,
          width: 23,
          height: 23,
          radio: [
            { x: 389, y: 141, width: 23, height: 23, page_number: 0, value: 'Yes' },
            { x: 389, y: 170, width: 23, height: 23, page_number: 0, value: 'No' }
          ],
          prefilled_text: 'Yes'
        },
        {
          type: 'enumeration',
          page_number: 0,
          name: 'Department',
          label: 'Your department',
          role: 'Recipient 1',
          required: true,
          custom_defined_option: true,
          enumeration_options: ['HR','IT','Finance'],
          height: 40,
          width: 70,
          x: 100,
          y: 32
        }
      ],
      checks: [
        { page_number: 0, width: 17, height: 17, x: 754, y: 417, size: 12, line_height: 16 }
      ],
      client_timestamp: new Date().toISOString()
    };

    // PUT fields to document
    const putUrl = `https://api.signnow.com/document/${docId}`;
    console.log('[signnow_invite] setting fields for document', docId);
    mark('before-put-fields');
    let putResp: Response;
    try {
      putResp = await fetchWithTimeout(putUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${SIGNNOW_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fieldsPayload),
      }, 30000);
    } catch (e) {
      console.error('[signnow_invite] put fetch error', String(e));
      return json({ error: 'Put fetch error', message: String(e) }, 504);
    }
    mark('after-put-fields');

    if (!putResp.ok) {
      const txt = await putResp.text().catch(() => '');
      console.error('[signnow_invite] put fields failed', putResp.status, txt);
      return json({ error: 'Put fields failed', status: putResp.status, body: txt }, 502);
    }

    const putJson = await putResp.text().catch(() => null);
    console.log('[signnow_invite] put response', putJson);

    // Invite
    const inviteUrl = `https://api.signnow.com/document/${docId}/invite`;
    const inviteBody = { to: [{ email: recipient_email, role: 'Recipient 1', reminder: 12, expiration_days: 30 }], from: SIGNNOW_FROM_EMAIL };
    console.log('[signnow_invite] sending invite to', recipient_email);
    mark('before-invite');
    let inviteResp: Response;
    try {
      inviteResp = await fetchWithTimeout(inviteUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SIGNNOW_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inviteBody),
      }, 30000);
    } catch (e) {
      console.error('[signnow_invite] invite fetch error', String(e));
      return json({ error: 'Invite fetch error', message: String(e) }, 504);
    }
    mark('after-invite');

    if (!inviteResp.ok) {
      const txt = await inviteResp.text().catch(() => '');
      console.error('[signnow_invite] invite failed', inviteResp.status, txt);
      return json({ error: 'Invite failed', status: inviteResp.status, body: txt }, 502);
    }

    const inviteJson = await inviteResp.json();
    console.log('[signnow_invite] invite response', inviteJson);
    mark('total-done');

    return json({ success: true, docId, invite: inviteJson, timings_ms: { total: Date.now() - startTime } }, 200);

  } catch (err) {
    console.error('signnow function error', err);
    return new Response(JSON.stringify({ error: 'internal_error', message: String(err) }), { status: 500 });
  }
}

// supabase edge functions expect default export for compatibility
export default handler;
