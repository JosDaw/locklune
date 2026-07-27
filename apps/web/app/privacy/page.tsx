import type { Metadata } from 'next';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How ${site.name} handles your data: it doesn't. Everything stays encrypted on your device.`,
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-10 text-2xl font-bold text-moon">{children}</h2>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 leading-relaxed text-text-muted">{children}</p>;
}

export default function Privacy() {
  return (
    <article className="py-16">
      <h1 className="text-4xl font-bold text-moon">Privacy Policy</h1>
      <p className="mt-3 text-sm text-text-faint">Last updated: {site.lastUpdated}</p>

      <P>
        {site.name} is designed so that your data never leaves your device. This policy explains what
        that means in practice. The short version: <strong className="text-text">we collect nothing.</strong>
      </P>

      <H2>Data we collect</H2>
      <P>
        None. {site.name} has no account system and no servers. We do not collect your name, email,
        phone number, location, device identifiers, or any usage analytics. We never see your cycle
        data or your PIN.
      </P>

      <H2>Where your data lives</H2>
      <P>
        All information you enter — period dates, flow, mood, symptoms and notes — is stored only on
        your device, inside a database encrypted with AES-256 (SQLCipher). The encryption key is
        derived from your PIN and is held in your device&apos;s secure hardware keystore. Without your
        PIN, the data is unreadable.
      </P>

      <H2>No network, no third parties</H2>
      <P>
        The app contains no networking code and no third-party SDKs, advertising, or analytics. There
        are no cookies and no trackers. Your data is never transmitted, sold, or shared, because it is
        never sent anywhere in the first place.
      </P>

      <H2>Notifications</H2>
      <P>
        If you enable reminders, they are scheduled locally by your operating system based on
        on-device predictions. No push service is used and no data is sent to schedule them.
      </P>

      <H2>Recovery</H2>
      <P>
        Because your data is encrypted with your PIN and we hold no copy of anything, a forgotten PIN
        means the data cannot be recovered — by you or by us. This is a deliberate security trade-off.
      </P>

      <H2>Deleting your data</H2>
      <P>
        You can erase everything instantly from within the app (Settings → Erase all data), or by
        deleting the app. There is nothing stored elsewhere to delete.
      </P>

      <H2>This website</H2>
      <P>
        This site is a static page served without cookies, analytics, or third-party fonts or scripts.
        Standard server access logs may be kept briefly by the hosting provider for security, but this
        site sets no identifiers and runs no tracking of its own.
      </P>

      <H2>Children</H2>
      <P>
        {site.name} does not knowingly collect data from anyone — including children — because it does
        not collect data at all.
      </P>

      <H2>Changes</H2>
      <P>
        If this policy changes, the “last updated” date above will change with it. Since we collect no
        contact information, please check back here for updates.
      </P>

      <H2>Contact</H2>
      <P>
        Questions? Email{' '}
        <a href={`mailto:${site.supportEmail}`} className="text-primary-soft underline">
          {site.supportEmail}
        </a>
        .
      </P>
    </article>
  );
}
