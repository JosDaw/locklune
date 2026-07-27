import Link from 'next/link';
import { features, site } from '@/lib/site';

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 py-24 text-center">
        <span className="rounded-full border border-border bg-surface px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary-soft">
          100% on-device · encrypted
        </span>
        <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-moon sm:text-6xl">
          {site.tagline}
        </h1>
        <p className="max-w-xl text-lg text-text-muted">{site.description}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
          <span className="cursor-default rounded-2xl bg-primary px-6 py-3 font-semibold text-ink">
            Coming soon to iOS &amp; Android
          </span>
          <Link
            href="/privacy"
            className="rounded-2xl border border-border px-6 py-3 font-semibold text-text hover:bg-surface"
          >
            Read our privacy promise
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="text-lg font-semibold text-text">{f.title}</h3>
            <p className="mt-2 text-text-muted">{f.body}</p>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="mt-24">
        <h2 className="text-3xl font-bold text-moon">How it stays private</h2>
        <ol className="mt-8 space-y-6">
          {[
            {
              n: '1',
              t: 'You set a PIN',
              d: 'Your PIN derives an encryption key that never leaves your device and is never stored.',
            },
            {
              n: '2',
              t: 'Everything is encrypted locally',
              d: 'Cycle data lives in an AES-256 encrypted database on your phone — unreadable without your PIN.',
            },
            {
              n: '3',
              t: 'Nothing is sent anywhere',
              d: 'The app has no servers and no network code, so there is nothing to intercept, breach or sell.',
            },
          ].map((s) => (
            <li key={s.n} className="flex gap-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-ink">
                {s.n}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">{s.t}</h3>
                <p className="mt-1 text-text-muted">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Privacy promise */}
      <section className="mt-24 rounded-2xl border border-border bg-surface p-10 text-center">
        <h2 className="text-3xl font-bold text-moon">The whole point is privacy</h2>
        <p className="mx-auto mt-4 max-w-2xl text-text-muted">
          {site.name} was built so that no one — not us, not an advertiser, not a data broker — can
          ever see your cycle. If you forget your PIN, even we cannot recover your data. That is by
          design.
        </p>
        <Link
          href="/privacy"
          className="mt-8 inline-block rounded-2xl bg-primary px-6 py-3 font-semibold text-ink"
        >
          Read the privacy policy
        </Link>
      </section>
    </>
  );
}
