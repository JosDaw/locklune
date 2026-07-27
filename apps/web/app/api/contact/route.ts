import { NextResponse } from 'next/server';
import { site } from '@/lib/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Body = {
  email?: string;
  message?: string;
  /** Honeypot: real users never see or fill this. */
  company?: string;
};

function validate(b: Body): string | null {
  const email = (b.email ?? '').trim();
  const message = (b.message ?? '').trim();
  if (!EMAIL_RE.test(email) || email.length > 200) return 'Please enter a valid email.';
  if (message.length < 10 || message.length > 5000) return 'Please enter a longer message.';
  return null;
}

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  // Honeypot: if a bot filled the hidden field, pretend success and drop it.
  if (body.company && body.company.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  const error = validate(body);
  if (error) return NextResponse.json({ ok: false, error }, { status: 400 });

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: 'Contact form is not configured yet.' },
      { status: 503 },
    );
  }

  const email = body.email!.trim();
  const message = body.message!.trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL ?? site.supportEmail;
  const toEmail = process.env.CONTACT_TO_EMAIL ?? site.supportEmail;

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Locklune Contact', email: senderEmail },
        to: [{ email: toEmail }],
        replyTo: { email },
        subject: 'Locklune contact form',
        textContent: `From: ${email}\n\n${message}`,
        htmlContent: `<p><strong>From:</strong> ${escapeHtml(email)}</p><p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>`,
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: 'Could not send right now.' }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'Could not send right now.' }, { status: 502 });
  }
}
