const SIGNNOW_DOC_ID = 'c4524e4d91da4706b583ae9e99b38ef005ac684e';

export type SignNowInviteResponse = any;

export async function sendSignNowInvite(recipientEmail: string, fromEmail: string): Promise<SignNowInviteResponse> {
  const apiKey = import.meta.env.VITE_SIGNNOW_API_KEY;
  if (!apiKey) throw new Error('SignNow API key not configured (VITE_SIGNNOW_API_KEY)');

  const url = `https://api.signnow.com/document/${SIGNNOW_DOC_ID}/invite`;
  const body = {
    to: [
      {
        email: recipientEmail,
        role: 'Recipient 1',
        reminder: 12,
        expiration_days: 30,
      },
    ],
    from: fromEmail,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`SignNow invite failed: ${res.status} ${res.statusText} ${text}`);
  }

  return res.json();
}
