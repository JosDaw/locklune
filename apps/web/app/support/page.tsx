import { ContactForm } from '@/components/contact-form';
import { site } from '@/lib/site';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support',
  description: `Frequently asked questions and how to reach the ${site.name} team.`,
};

const faqs = [
  {
    question: 'I forgot my PIN. Can you reset it?',
    answer:
      'No, and neither can we. Your PIN is the encryption key to your data, and we never receive or store it. A forgotten PIN means the data cannot be recovered - this is the price of true privacy. If you are locked out, you can choose Reset and start over on the lock screen: this erases everything on the device and lets you set up again with a new PIN.',
  },
  {
    question: 'Is my data backed up to the cloud?',
    answer:
      'No. Nothing is uploaded anywhere. Your data lives only on your device. If you get a new phone, previous data does not transfer automatically.',
  },
  {
    question: 'How are predictions calculated?',
    answer:
      'Locklune estimates your next period from a recency-weighted average of your recent cycle lengths, with an uncertainty range based on how regular your cycles are. Ovulation is estimated from a roughly constant luteal phase, and the fertile window from typical sperm and egg viability. Everything is computed on your device and adapts as you log more cycles.',
  },
  {
    question: 'Are predictions medical or contraceptive advice?',
    answer:
      'No. They are estimates for your awareness only and should not be relied on for contraception or medical decisions.',
  },
  {
    question: 'How do I erase everything?',
    answer:
      'Open Settings, then Erase all data, or simply delete the app. There is nothing stored elsewhere.',
  },
];

export default function Support() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-4xl font-semibold tracking-tight text-fg">Support</h1>
      <p className="mt-4 text-fg-soft">
        Common questions below. Still need help? Send us a message and we will reply by email.
      </p>

      <div className="mt-10 space-y-4">
        {faqs.map((faq) => (
          <div key={faq.question} className="surface p-6">
            <h2 className="font-display text-lg font-semibold text-fg">{faq.question}</h2>
            <p className="mt-2 leading-relaxed text-fg-muted">{faq.answer}</p>
          </div>
        ))}
      </div>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-fg">Contact us</h2>
        <p className="mt-2 text-fg-muted">
          Browsing this site collects nothing. When you send this form, your email (optional) and
          message are emailed to our support inbox so we can reply, and used for nothing else.
        </p>
        <div className="mt-6">
          <ContactForm />
        </div>
      </section>
    </article>
  );
}
