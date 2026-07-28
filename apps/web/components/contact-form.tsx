'use client';

import { type FormEvent, useState } from 'react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function ContactForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [company, setCompany] = useState(''); // honeypot
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const clientValidate = (): string | null => {
    const e = email.trim();
    if (e && !EMAIL_RE.test(e)) return 'That email address doesn't look right.';
    if (message.trim().length < 10) return 'Please enter a message of at least 10 characters.';
    return null;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
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
        setError(data.error ?? 'Could not send right now. Please try again.');
        setStatus('error');
      }
    } catch {
      setError('Could not send right now. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="surface p-6 text-center">
        <p className="font-display text-lg font-semibold text-fg">Thanks, your message was sent.</p>
        <p className="mt-2 text-fg-muted">
          {email.trim() ? 'We will get back to you by email.' : 'Your message was received anonymously.'}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="surface space-y-4 p-6" noValidate>
      {/* Honeypot: hidden from real users; bots that fill it are dropped server-side. */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company
          <input
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </label>
      </div>

      <div className="rounded-2xl border border-star/30 bg-star/[0.06] p-4 text-sm text-fg-soft">
        Please do <strong className="text-fg">not</strong> include any personal information about your
        fertility or menstrual cycle in this form.
      </div>

      <div>
        <label htmlFor="cf-email" className="mb-1.5 block text-sm text-fg-soft">
          Email <span className="text-fg-muted">(optional)</span>
        </label>
        <input
          id="cf-email"
          type="email"
          value={email}
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-2xl border border-line bg-night2 px-4 py-3 text-fg outline-none placeholder:text-fg-muted focus:border-lock"
        />
        <p className="mt-1.5 text-xs text-fg-muted">
          Include your email if you'd like a reply - or leave it blank to contact anonymously.
        </p>
      </div>

      <div>
        <label htmlFor="cf-message" className="mb-1.5 block text-sm text-fg-soft">
          Message
        </label>
        <textarea
          id="cf-message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
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
        {status === 'sending' ? 'Sending' : 'Send message'}
      </button>
    </form>
  );
}
