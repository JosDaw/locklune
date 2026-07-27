import type { Metadata } from 'next';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Support',
  description: `Frequently asked questions and how to reach the ${site.name} team.`,
};

const faqs = [
  {
    q: 'I forgot my PIN. Can you reset it?',
    a: 'No — and neither can we. Your PIN is the encryption key to your data, and we never receive or store it. A forgotten PIN means the data cannot be recovered. This is the price of true privacy.',
  },
  {
    q: 'Is my data backed up to the cloud?',
    a: 'No. Nothing is uploaded anywhere. Your data lives only on your device. If you get a new phone, previous data does not transfer automatically.',
  },
  {
    q: 'How are predictions calculated?',
    a: 'Locklune estimates your next period from a recency-weighted average of your recent cycle lengths, with an uncertainty range based on how regular your cycles are. Ovulation is estimated from a roughly constant luteal phase, and the fertile window from typical sperm and egg viability. Everything is computed on your device and adapts as you log more cycles.',
  },
  {
    q: 'Are predictions medical or contraceptive advice?',
    a: 'No. They are estimates for your awareness only and should not be relied on for contraception or medical decisions.',
  },
  {
    q: 'How do I erase everything?',
    a: 'Open Settings → Erase all data, or simply delete the app. There is nothing stored elsewhere.',
  },
];

export default function Support() {
  return (
    <article className="py-16">
      <h1 className="text-4xl font-bold text-moon">Support</h1>
      <p className="mt-4 text-text-muted">
        Common questions below. Still stuck? Email{' '}
        <a href={`mailto:${site.supportEmail}`} className="text-primary-soft underline">
          {site.supportEmail}
        </a>
        .
      </p>

      <div className="mt-10 space-y-4">
        {faqs.map((f) => (
          <div key={f.q} className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold text-text">{f.q}</h2>
            <p className="mt-2 leading-relaxed text-text-muted">{f.a}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
