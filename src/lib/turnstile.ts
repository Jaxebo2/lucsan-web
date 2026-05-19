/**
 * Cloudflare Turnstile — server-side validation helper.
 *
 * Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

interface TurnstileResult {
  success: boolean;
  errorCodes?: string[];
}

export async function verifyTurnstile(
  token: string | null,
  remoteIp?: string,
): Promise<TurnstileResult> {
  const secret = import.meta.env.TURNSTILE_SECRET_KEY;

  // If no secret configured (dev/local), allow through with a warning
  if (!secret) {
    console.warn('TURNSTILE_SECRET_KEY not set — bypassing captcha (dev only)');
    return { success: true };
  }

  if (!token) {
    return { success: false, errorCodes: ['missing-input-response'] };
  }

  const formData = new FormData();
  formData.append('secret', secret);
  formData.append('response', token);
  if (remoteIp) formData.append('remoteip', remoteIp);

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });
    const data = (await res.json()) as {
      success: boolean;
      'error-codes'?: string[];
    };
    return {
      success: data.success === true,
      errorCodes: data['error-codes'],
    };
  } catch (err) {
    console.error('Turnstile verification failed:', err);
    return { success: false, errorCodes: ['internal-error'] };
  }
}
