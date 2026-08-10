import { GithubIcon } from '@/components/icons';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Logo, MoonMark } from '@/components/logo';
import { locales } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { site } from '@/lib/site';
import { Coffee as CoffeeIcon, Heart as HeartIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import Link from 'next/link';
import '../globals.css';

// Self-hosted at build time - zero runtime requests to Google.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' });

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return {
    metadataBase: new URL(site.url),
    title: {
      default: dict.meta.titleDefault,
      template: `%s · ${site.name}`,
    },
    description: dict.meta.description,
    applicationName: site.name,
    robots: { index: true, follow: true },
    alternates: {
      languages: Object.fromEntries(locales.map((code) => [code, `/${code}`])),
    },
    openGraph: {
      title: site.name,
      description: dict.meta.description,
      url: `${site.url}/${locale}`,
      siteName: site.name,
      type: 'website',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const base = `/${locale}`;

  const nav = [
    { href: `${base}#privacy`, label: dict.nav.privacy },
    { href: `${base}#tracking`, label: dict.nav.tracking },
    { href: `${base}#security`, label: dict.nav.security },
    { href: `${base}/support`, label: dict.nav.support },
  ];

  return (
    <html lang={locale} className={`${inter.variable} ${manrope.variable}`}>
      <body className="min-h-screen bg-night font-sans text-fg antialiased">
        <header className="sticky top-0 z-50 border-b border-line/70">
          <div className="glass">
            <nav className="mx-auto flex max-w-container items-center justify-between px-6 py-3.5">
              <Link href={base} aria-label={dict.nav.home}>
                <Logo />
              </Link>
              <div className="hidden items-center gap-8 md:flex">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm text-fg-soft transition-colors hover:text-fg"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <LanguageSwitcher locale={locale} label={dict.nav.language} />
                <Link
                  href={`${base}#download`}
                  className="rounded-full bg-fg px-4 py-2 text-sm font-semibold text-night transition-transform hover:scale-[1.03]"
                >
                  {dict.nav.download}
                </Link>
              </div>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        <footer className="mt-28 border-t border-line">
          <div className="mx-auto max-w-container px-6 py-14">
            <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
              <div className="max-w-xs">
                <Logo />
                <p className="mt-4 text-sm leading-relaxed text-fg-muted">{dict.footer.tagline}</p>
              </div>
              <div className="flex flex-wrap gap-x-16 gap-y-8 text-sm">
                <div className="flex flex-col gap-3">
                  <span className="text-xs uppercase tracking-widest text-fg-muted">
                    {dict.footer.product}
                  </span>
                  <Link href={`${base}#privacy`} className="text-fg-soft hover:text-fg">
                    {dict.footer.privacyFirst}
                  </Link>
                  <Link href={`${base}#security`} className="text-fg-soft hover:text-fg">
                    {dict.footer.security}
                  </Link>
                  <Link href={`${base}/support`} className="text-fg-soft hover:text-fg">
                    {dict.footer.support}
                  </Link>
                </div>
                <div className="flex flex-col gap-3">
                  <span className="text-xs uppercase tracking-widest text-fg-muted">
                    {dict.footer.legal}
                  </span>
                  <Link href={`${base}/privacy`} className="text-fg-soft hover:text-fg">
                    {dict.footer.privacyPolicy}
                  </Link>
                  <Link href={`${base}/terms`} className="text-fg-soft hover:text-fg">
                    {dict.footer.terms}
                  </Link>
                </div>
                <div className="flex flex-col gap-3">
                  <span className="text-xs uppercase tracking-widest text-fg-muted">
                    {dict.footer.elsewhere}
                  </span>
                  <a
                    href={site.github}
                    className="inline-flex items-center gap-2 text-fg-soft hover:text-fg"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <GithubIcon className="h-4 w-4" /> GitHub
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-12 border-t border-line pt-6 text-xs text-fg-muted">
              <p className="text-center">{dict.footer.disclaimer}</p>
              <div className="mt-4 flex items-center justify-between">
                <p>
                  © {new Date().getFullYear()} {site.name}
                </p>
                <p className="flex items-center gap-1.5">
                  <MoonMark className="h-4 w-4" /> {dict.footer.noTracking}
                </p>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
                <span className="flex items-center gap-1.5">
                  {dict.footer.madeWith} <HeartIcon className="h-4 w-4 text-lock" />
                </span>
                <a
                  href="https://ko-fi.com/constantlearning"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 font-medium text-fg-soft transition-colors hover:text-fg"
                >
                  <CoffeeIcon className="h-4 w-4" /> {dict.footer.supportCreator}
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
