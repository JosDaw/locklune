import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — private, offline period tracking`,
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink font-sans text-text antialiased">
        <header className="sticky top-0 z-10 border-b border-border/60 bg-ink/80 backdrop-blur">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-bold text-moon">
              {site.name}
            </Link>
            <div className="flex items-center gap-6 text-sm text-text-muted">
              <Link href="/privacy" className="hover:text-text">
                Privacy
              </Link>
              <Link href="/support" className="hover:text-text">
                Support
              </Link>
            </div>
          </nav>
        </header>

        <main className="mx-auto max-w-5xl px-6">{children}</main>

        <footer className="mx-auto mt-24 max-w-5xl px-6 pb-12">
          <div className="border-t border-border/60 pt-8 text-sm text-text-faint">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p>
                © {new Date().getFullYear()} {site.name}. No cookies. No tracking. No servers.
              </p>
              <div className="flex gap-6">
                <Link href="/privacy" className="hover:text-text-muted">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-text-muted">
                  Terms
                </Link>
                <Link href="/support" className="hover:text-text-muted">
                  Support
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
