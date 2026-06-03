import { increscendoApiFetch } from './increscendoApi';

const EMAIL_API_KEY = import.meta.env.VITE_EMAIL_API_KEY || '';

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
}

export const sendEmail = async (params: SendEmailParams): Promise<void> => {
  try {
    const resp = await increscendoApiFetch('https://increscendo-api.vercel.app/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': EMAIL_API_KEY,
      },
      body: JSON.stringify(params),
    });
    if (!resp.ok) {
      const data = await resp.json().catch(() => null);
      console.warn('[email] send failed', resp.status, data);
    }
  } catch (err) {
    console.warn('[email] send error', err);
  }
};
