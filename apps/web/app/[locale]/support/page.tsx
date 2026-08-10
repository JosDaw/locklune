import { ContactForm } from '@/components/contact-form';
import { getDictionary } from '@/i18n/dictionaries';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return { title: dict.meta.supportTitle, description: dict.meta.supportDescription };
}

export default async function Support({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-4xl font-semibold tracking-tight text-fg">
        {dict.support.title}
      </h1>
      <p className="mt-4 text-fg-soft">{dict.support.intro}</p>

      <div className="mt-10 space-y-4">
        {dict.support.faqs.map((faq) => (
          <div key={faq.question} className="surface p-6">
            <h2 className="font-display text-lg font-semibold text-fg">{faq.question}</h2>
            <p className="mt-2 leading-relaxed text-fg-muted">{faq.answer}</p>
          </div>
        ))}
      </div>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-fg">{dict.support.contactTitle}</h2>
        <p className="mt-2 text-fg-muted">{dict.support.contactIntro}</p>
        <div className="mt-6">
          <ContactForm t={dict.contact} />
        </div>
      </section>
    </article>
  );
}
