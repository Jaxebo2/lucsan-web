import { Resend } from 'resend';

let cachedResend: Resend | null = null;

export const getResend = (): Resend => {
  if (cachedResend) return cachedResend;

  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY not configured in environment');
  }

  cachedResend = new Resend(apiKey);
  return cachedResend;
};

export const FROM_EMAIL = import.meta.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
export const TO_EMAIL = import.meta.env.CONTACT_TO_EMAIL ?? 'contacto@lucsandesign.com';
