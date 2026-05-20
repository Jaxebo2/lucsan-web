import type { APIRoute } from 'astro';
import { z } from 'astro:content';
import { getResend, FROM_EMAIL, TO_EMAIL } from '../../lib/resend';
import { verifyTurnstile } from '../../lib/turnstile';

export const prerender = false;

const ContactSchema = z.object({
  nombre: z.string().min(2).max(100),
  email: z.string().email().max(200),
  empresa: z.string().max(200).optional().default(''),
  servicio: z.enum(['branding', 'diseno-web', 'marketing-digital', 'otro']),
  presupuesto: z.string().max(100).optional().default(''),
  mensaje: z.string().min(20).max(5000),
  // Honeypot — should always be empty (bots fill it)
  website: z.string().max(0).optional().default(''),
  // Turnstile token
  'cf-turnstile-response': z.string().optional(),
});

const SERVICIO_LABELS: Record<string, string> = {
  branding: 'Branding y diseño de marca',
  'diseno-web': 'Diseño web',
  'marketing-digital': 'Marketing digital',
  otro: 'Otro / no estoy seguro',
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Accept JSON or form-encoded
  let payload: Record<string, unknown>;
  try {
    const contentType = request.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      payload = await request.json();
    } else {
      const formData = await request.formData();
      payload = Object.fromEntries(formData.entries());
    }
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate schema
  const parsed = ContactSchema.safeParse(payload);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'Datos inválidos',
        issues: parsed.error.flatten().fieldErrors,
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const data = parsed.data;

  // Honeypot — silently accept but don't actually send
  if (data.website && data.website.length > 0) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Turnstile verification (skipped if no secret configured)
  const turnstile = await verifyTurnstile(
    data['cf-turnstile-response'] ?? null,
    clientAddress,
  );
  if (!turnstile.success) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Verificación captcha falló' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Send via Resend
  try {
    const resend = getResend();
    const servicioLabel = SERVICIO_LABELS[data.servicio] ?? data.servicio;

    const subject = `Nuevo contacto — ${data.nombre}${data.empresa ? ` (${data.empresa})` : ''}`;

    const textBody = [
      `Nombre: ${data.nombre}`,
      `Email: ${data.email}`,
      data.empresa ? `Empresa: ${data.empresa}` : null,
      `Servicio: ${servicioLabel}`,
      data.presupuesto ? `Presupuesto: ${data.presupuesto}` : null,
      '',
      'Mensaje:',
      data.mensaje,
    ]
      .filter(Boolean)
      .join('\n');

    const htmlBody = `<!doctype html>
<html><body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #08080c;">
  <h2 style="color: #ff5548; margin-top: 0;">Nuevo contacto desde lucsandesign.com</h2>
  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <tr><td style="padding: 6px 0; color: #6b6b75;">Nombre</td><td style="padding: 6px 0;"><strong>${escapeHtml(data.nombre)}</strong></td></tr>
    <tr><td style="padding: 6px 0; color: #6b6b75;">Email</td><td style="padding: 6px 0;"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td></tr>
    ${data.empresa ? `<tr><td style="padding: 6px 0; color: #6b6b75;">Empresa</td><td style="padding: 6px 0;">${escapeHtml(data.empresa)}</td></tr>` : ''}
    <tr><td style="padding: 6px 0; color: #6b6b75;">Servicio</td><td style="padding: 6px 0;">${escapeHtml(servicioLabel)}</td></tr>
    ${data.presupuesto ? `<tr><td style="padding: 6px 0; color: #6b6b75;">Presupuesto</td><td style="padding: 6px 0;">${escapeHtml(data.presupuesto)}</td></tr>` : ''}
  </table>
  <h3 style="color: #08080c; margin-top: 24px;">Mensaje</h3>
  <p style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(data.mensaje)}</p>
</body></html>`;

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: data.email,
      subject,
      text: textBody,
      html: htmlBody,
    });

    if (error) {
      console.error('Resend send error:', error);
      return new Response(
        JSON.stringify({ ok: false, error: 'No pudimos enviar el mensaje. Inténtalo de nuevo o escríbenos por WhatsApp.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Contact form error:', err);
    return new Response(
      JSON.stringify({ ok: false, error: 'Error interno. Inténtalo de nuevo.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
