import { GithubIcon } from '@/components/icons';
import { Logo, MoonMark } from '@/components/logo';
import { site } from '@/lib/site';
import { Coffee as CoffeeIcon, Heart as HeartIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

// Self-hosted at build time - zero runtime requests to Google.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}: private, offline period tracking`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  robots: { index: true, follow: true },
  openGraph: {
    title: site.name,
    description: site.description,
    url: site.url,
    siteName: site.name,
    type: 'website',
  },
};

const nav = [
  { href: '/#privacy', label: 'Privacy' },
  { href: '/#tracking', label: 'Tracking' },
  { href: '/#security', label: 'Security' },
  { href: '/support', label: 'Support' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body className="min-h-screen bg-night font-sans text-fg antialiased">
        <header className="sticky top-0 z-50 border-b border-line/70">
          <div className="glass">
            <nav className="mx-auto flex max-w-container items-center justify-between px-6 py-3.5">
              <Link href="/" aria-label="Locklune home">
                <Logo />
              </Link>
              <div className="hidden items-center gap-8 md:flex">
                {nav.map((n) => (
                  <Link key={n.href} href={n.href} className="text-sm text-fg-soft transition-colors hover:text-fg">
                    {n.label}
                  </Link>
                ))}
              </div>
              <Link
                href="/#download"
                className="rounded-full bg-fg px-4 py-2 text-sm font-semibold text-night transition-transform hover:scale-[1.03]"
              >
                Download
              </Link>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        <footer className="mt-28 border-t border-line">
          <div className="mx-auto max-w-container px-6 py-14">
            <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
              <div className="max-w-xs">
                <Logo />
                <p className="mt-4 text-sm leading-relaxed text-fg-muted">
                  A period tracker that stays on your device. Private. Secure. Only yours.
                </p>
              </div>
              <div className="flex flex-wrap gap-x-16 gap-y-8 text-sm">
                <div className="flex flex-col gap-3">
                  <span className="text-xs uppercase tracking-widest text-fg-muted">Product</span>
                  <Link href="/#privacy" className="text-fg-soft hover:text-fg">Privacy first</Link>
                  <Link href="/#security" className="text-fg-soft hover:text-fg">Security</Link>
                  <Link href="/support" className="text-fg-soft hover:text-fg">Support</Link>
                </div>
                <div className="flex flex-col gap-3">
                  <span className="text-xs uppercase tracking-widest text-fg-muted">Legal</span>
                  <Link href="/privacy" className="text-fg-soft hover:text-fg">Privacy Policy</Link>
                  <Link href="/terms" className="text-fg-soft hover:text-fg">Terms</Link>
                </div>
                <div className="flex flex-col gap-3">
                  <span className="text-xs uppercase tracking-widest text-fg-muted">Elsewhere</span>
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
              <p className="text-center">
                Locklune is for record keeping purposes only and is not medical or health advice.
              </p>
              <div className="mt-4 flex items-center justify-between">
                <p>© {new Date().getFullYear()} {site.name}</p>
                <p className="flex items-center gap-1.5">
                  <MoonMark className="h-4 w-4" /> No cookies. No tracking. No servers.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
                <span className="flex items-center gap-1.5">
                  Made with <HeartIcon className="h-4 w-4 text-lock" />
                </span>
                <a
                  href="https://ko-fi.com/constantlearning"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 font-medium text-fg-soft transition-colors hover:text-fg"
                >
                  <CoffeeIcon className="h-4 w-4" /> Support the creator
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
