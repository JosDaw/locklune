'use client';

import type { Dictionary } from '@/i18n/dictionaries/en';
import { type FormEvent, useState } from 'react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function ContactForm({ t }: { t: Dictionary['contact'] }) {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [company, setCompany] = useState<string>(''); // honeypot
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const clientValidate = (): string | null => {
    const trimmedEmail = email.trim();
    if (trimmedEmail && !EMAIL_RE.test(trimmedEmail)) return t.emailInvalid;
    if (message.trim().length < 10) return t.messageMin;
    return null;
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === 'sending') return;
    const invalid = clientValidate();
    if (invalid) {
      setError(invalid);
      setStatus('error');
      return;
    }
    setStatus('sending');
    setError(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, message, company }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setStatus('sent');
        setEmail('');
        setMessage('');
      } else {
        setError(data.error ?? t.sendError);
        setStatus('error');
      }
    } catch {
      setError(t.sendError);
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="surface p-6 text-center">
        <p className="font-display text-lg font-semibold text-fg">{t.sentTitle}</p>
        <p className="mt-2 text-fg-muted">{email.trim() ? t.sentReplyEmail : t.sentAnon}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="surface space-y-4 p-6" noValidate>
      {/* Honeypot: hidden from real users; bots that fill it are dropped server-side. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden"
      >
        <label>
          {t.company}
          <input
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
          />
        </label>
      </div>

      <div className="rounded-2xl border border-star/30 bg-star/[0.06] p-4 text-sm text-fg-soft">
        {t.noPersonalInfoBefore}
        <strong className="text-fg">{t.noPersonalInfoBold}</strong>
        {t.noPersonalInfoAfter}
      </div>

      <div>
        <label htmlFor="cf-email" className="mb-1.5 block text-sm text-fg-soft">
          {t.emailLabel} <span className="text-fg-muted">{t.optional}</span>
        </label>
        <input
          id="cf-email"
          type="email"
          value={email}
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-2xl border border-line bg-night2 px-4 py-3 text-fg outline-none placeholder:text-fg-muted focus:border-lock"
        />
        <p className="mt-1.5 text-xs text-fg-muted">{t.emailHint}</p>
      </div>

      <div>
        <label htmlFor="cf-message" className="mb-1.5 block text-sm text-fg-soft">
          {t.messageLabel}
        </label>
        <textarea
          id="cf-message"
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="w-full rounded-2xl border border-line bg-night2 px-4 py-3 text-fg outline-none placeholder:text-fg-muted focus:border-lock"
        />
      </div>

      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="rounded-full bg-fg px-6 py-3 text-sm font-semibold text-night transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {status === 'sending' ? t.sending : t.sendMessage}
      </button>
    </form>
  );
}
