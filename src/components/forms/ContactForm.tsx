import { useEffect, useRef, useState } from 'react';

interface Props {
  presupuestos: string[];
  turnstileSiteKey?: string;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement | string, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

export default function ContactForm({ presupuestos, turnstileSiteKey }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const turnstileRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  // Load Turnstile script + render widget
  useEffect(() => {
    if (!turnstileSiteKey || !turnstileRef.current) return;

    const renderWidget = () => {
      if (window.turnstile && turnstileRef.current) {
        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: turnstileSiteKey,
          theme: 'light',
        });
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.onload = renderWidget;
      document.head.appendChild(script);
    }
  }, [turnstileSiteKey]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };

      if (data.ok) {
        setStatus('success');
        e.currentTarget.reset();
        if (turnstileSiteKey && window.turnstile && widgetIdRef.current) {
          window.turnstile.reset(widgetIdRef.current);
        }
      } else {
        setStatus('error');
        setErrorMsg(data.error ?? 'Algo salió mal. Inténtalo de nuevo.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('No pudimos conectar con el servidor. Inténtalo de nuevo.');
    }
  };

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-success/30 bg-success-bg p-8 text-center">
        <p className="text-2xl">✓</p>
        <h3 className="mt-4 font-display text-2xl font-bold text-brand-black">
          ¡Mensaje enviado!
        </h3>
        <p className="mt-3 text-text-secondary">
          Te respondemos en menos de 24 horas hábiles. Mientras tanto, revisa tu bandeja de
          entrada por si tienes un correo de confirmación.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-6 text-sm font-medium text-text-accent hover:underline"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  const inputClass =
    'rounded-md border border-border-default bg-surface-page px-4 py-3 text-base focus:border-border-accent focus:outline-none transition-colors';

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
      {/* Honeypot — hidden, bots fill it */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
        aria-hidden="true"
      />

      <div className="grid gap-5 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Nombre</span>
          <input
            type="text"
            name="nombre"
            required
            minLength={2}
            autoComplete="name"
            className={inputClass}
            placeholder="Tu nombre"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className={inputClass}
            placeholder="tu@correo.com"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">
          Empresa <span className="text-text-muted">(opcional)</span>
        </span>
        <input
          type="text"
          name="empresa"
          autoComplete="organization"
          className={inputClass}
          placeholder="Nombre de tu empresa"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">¿En qué te podemos ayudar?</span>
        <select name="servicio" required className={inputClass} defaultValue="">
          <option value="" disabled>
            Elegí un servicio
          </option>
          <option value="branding">Branding y diseño de marca</option>
          <option value="diseno-web">Diseño web</option>
          <option value="marketing-digital">Marketing digital</option>
          <option value="otro">Otro / no estoy seguro</option>
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">
          Presupuesto aproximado <span className="text-text-muted">(opcional)</span>
        </span>
        <select name="presupuesto" className={inputClass} defaultValue="">
          <option value="">No estoy seguro</option>
          {presupuestos.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Cuéntanos sobre el proyecto</span>
        <textarea
          name="mensaje"
          required
          minLength={20}
          rows={5}
          className={inputClass}
          placeholder="Objetivo, plazo aproximado, contexto relevante…"
        />
      </label>

      {turnstileSiteKey && <div ref={turnstileRef} className="mt-2" />}

      {status === 'error' && errorMsg && (
        <p className="rounded-md border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">
          {errorMsg}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between gap-4">
        <p className="text-xs text-text-muted">
          Al enviar aceptas nuestra{' '}
          <a href="/legal/privacidad" className="underline hover:text-text-accent">
            política de privacidad
          </a>
          .
        </p>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="inline-flex items-center gap-2 rounded-full bg-brand-coral px-6 py-3 font-medium text-neutral-50 transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === 'submitting' ? 'Enviando…' : 'Enviar mensaje'}
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}
