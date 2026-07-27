import type { Metadata } from 'next';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: `The terms for using ${site.name}.`,
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-10 font-display text-2xl font-semibold text-fg">{children}</h2>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 leading-relaxed text-fg-soft">{children}</p>;
}

export default function Terms() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-4xl font-semibold tracking-tight text-fg">Terms of Use</h1>
      <p className="mt-3 text-sm text-fg-muted">Last updated: {site.lastUpdated}</p>

      <H2>Acceptance</H2>
      <P>By using {site.name}, you agree to these terms. If you do not agree, please do not use the app.</P>

      <H2>Not medical advice</H2>
      <P>
        {site.name} is an informational tool. Its predictions and insights are estimates only and are
        not medical advice, a diagnosis, or a contraceptive method. Do not rely on them for preventing
        or achieving pregnancy or for any medical decision. Consult a qualified healthcare provider for
        medical concerns.
      </P>

      <H2>Your data and PIN</H2>
      <P>
        You are responsible for remembering your PIN. Because your data is encrypted with it and we
        store no copy, a lost PIN results in permanent, unrecoverable loss of your data.
      </P>

      <H2>No warranty</H2>
      <P>
        {site.name} is provided “as is”, without warranties of any kind. We do not guarantee the
        accuracy of predictions or that the app will be uninterrupted or error-free.
      </P>

      <H2>Limitation of liability</H2>
      <P>
        To the maximum extent permitted by law, we are not liable for any damages arising from your use
        of {site.name}, including any loss of data.
      </P>

      <H2>Changes</H2>
      <P>We may update these terms; the “last updated” date will reflect any change.</P>

      <H2>Contact</H2>
      <P>
        Questions about these terms? Use the{' '}
        <a href="/support" className="text-lock underline underline-offset-4">
          contact form
        </a>{' '}
        on our support page.
      </P>
    </article>
  );
}
