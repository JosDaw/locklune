import { site } from '@/lib/site';
import type { Metadata } from 'next';

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
      <P>
        By using {site.name}, you agree to these terms. If you do not agree, please do not use the
        app.
      </P>

      <H2>Eligibility</H2>
      <P>
        You must be of legal age in your jurisdiction to use {site.name}. If you are under 18, you
        must have the consent of a parent or legal guardian. By using the app, you represent that
        you meet this requirement. We do not knowingly provide services to minors without parental
        consent.
      </P>

      <H2>Permitted use</H2>
      <P>
        {site.name} is provided for lawful personal use only. You agree not to use the app for any
        unlawful purpose or in any way that violates these terms. You are solely responsible for
        ensuring your use of the app complies with all laws applicable to you.
      </P>

      <H2>Not medical advice</H2>
      <P>
        {site.name} is an informational tool. Its predictions and insights are estimates only and
        are not medical advice, a diagnosis, or a contraceptive method. Do not rely on them for
        preventing or achieving pregnancy or for any medical decision. Consult a qualified
        healthcare provider for medical concerns.
      </P>

      <H2>Your data and PIN</H2>
      <P>
        You are responsible for remembering your PIN. Because your data is encrypted with it and we
        store no copy, a lost PIN results in permanent, unrecoverable loss of your data.
      </P>
      <P>
        {site.name} has zero access to your data - encrypted or otherwise. All data is stored
        exclusively on your device, encrypted with a key derived from your PIN. The only person who
        has access to the decryption PIN is the person who created it. {site.name} and its
        developers do not hold, transmit, or have any means of accessing your PIN, your encryption
        key, or your data. As a result, we cannot - under any circumstances, including legal
        compulsion, court order, or warrant - provide your PIN, decrypt your data, or assist in
        gaining access to it. We have nothing to provide.
      </P>

      <H2>No professional relationship</H2>
      <P>
        Use of {site.name} does not create any professional relationship - medical, legal,
        financial, psychological, or otherwise - between you and {site.name} or its developers.
        Nothing in the app or on this site constitutes professional advice of any kind.
      </P>

      <H2>No warranty</H2>
      <P>
        {site.name} is provided “as is”, without warranties of any kind. We do not guarantee the
        accuracy of predictions or that the app will be uninterrupted or error-free.
      </P>

      <H2>Legal compliance</H2>
      <P>
        {site.name} is intended for personal data management on your own device. You are solely
        responsible for your use of the app and for complying with all laws applicable to you. In
        many jurisdictions, if law enforcement presents a valid warrant or court order, you may be
        legally required to provide access to encrypted data or disclose your encryption key.
        {site.name} and its developers are not responsible for any legal consequences arising from
        your use of the app, including any consequences resulting from your failure to comply with
        applicable law.
      </P>

      <H2>Limitation of liability</H2>
      <P>
        To the maximum extent permitted by law, {site.name} and its associated developers are not
        liable for any damages - direct, indirect, incidental, special, consequential, or otherwise
        - arising from your use of {site.name}, including but not limited to loss of data, legal
        proceedings, or any other consequences of using or misusing the app's features.
      </P>

      <H2>Third-party software</H2>
      <P>
        {site.name} is built on open-source and third-party libraries (including SQLCipher and the
        Expo platform). Those components are provided under their own licences and are subject to
        their own terms. We make no warranties regarding third-party software and accept no
        liability for any issues arising from it.
      </P>

      <H2>App store terms</H2>
      <P>
        {site.name} is distributed via the Apple App Store and Google Play. Your download and use of
        the app is also subject to the terms and conditions of the relevant app store. In the event
        of a conflict between those terms and these terms, the app store terms will prevail to the
        extent of the conflict.
      </P>

      <H2>Governing law</H2>
      <P>
        These terms are governed by and construed in accordance with the laws of Australia. Any
        disputes arising from your use of {site.name} will be subject to the exclusive jurisdiction
        of the courts of Australia.
      </P>

      <H2>Severability</H2>
      <P>
        If any provision of these terms is found to be invalid, unlawful, or unenforceable by a
        court of competent jurisdiction, that provision will be severed from the remaining terms,
        which will continue in full force and effect.
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
