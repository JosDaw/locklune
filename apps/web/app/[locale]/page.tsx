import { Backdrop } from '@/components/backdrop';
import { MoonMark } from '@/components/logo';
import { PhoneMockup } from '@/components/phone';
import { getDictionary } from '@/i18n/dictionaries';
import { site } from '@/lib/site';
import {
  CalendarDays as CalendarIcon,
  Check as CheckIcon,
  CloudOff as CloudOffIcon,
  EyeOff as EyeOffIcon,
  Lock as LockIcon,
  Moon as MoonIcon,
  Server as ServerIcon,
  ShieldCheck as ShieldIcon,
  Sparkles as SparkIcon,
  Trash2 as TrashIcon,
  WifiOff as WifiOffIcon,
  X as XIcon,
} from 'lucide-react';
import Link from 'next/link';

const featureIcons = [LockIcon, MoonIcon, CloudOffIcon];
const securityIcons = [ShieldIcon, LockIcon, WifiOffIcon, ServerIcon, EyeOffIcon, TrashIcon];

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const base = `/${locale}`;

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <Backdrop />
        <div className="mx-auto grid max-w-container items-center gap-16 px-6 pb-10 pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:pt-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-fg-soft">
              <MoonMark className="h-4 w-4" /> {dict.hero.badge}
            </span>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-fg sm:text-5xl lg:text-6xl">
              <span className="text-gradient-moon">{dict.hero.tagline}</span>
            </h1>
            <div className="mt-6 max-w-md space-y-1.5 text-lg leading-relaxed text-fg-soft">
              <p>{dict.hero.sub1}</p>
              <p className="text-fg-muted">{dict.hero.sub2}</p>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href={`${base}#download`}
                className="inline-flex items-center gap-2 rounded-full bg-fg px-6 py-3 text-sm font-semibold text-night transition-transform hover:scale-[1.03]"
              >
                {dict.hero.downloadFree}
              </Link>
              <Link
                href={`${base}#security`}
                className="inline-flex items-center text-sm font-medium text-fg-soft underline underline-offset-4 transition-colors hover:text-fg"
              >
                {dict.hero.learnPrivacy}
              </Link>
            </div>
            <p className="mt-4 text-xs text-fg-muted">{dict.hero.availability}</p>
          </div>

          <div className="relative">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* ---------- Privacy first ---------- */}
      <Section id="privacy" eyebrow={dict.privacySection.eyebrow} title={dict.privacySection.title}>
        <div className="grid gap-5 md:grid-cols-3">
          {dict.privacySection.cards.map((card, index) => {
            const Icon = featureIcons[index % featureIcons.length]!;
            return (
              <FeatureCard
                key={card.title}
                icon={<Icon className="h-6 w-6" />}
                title={card.title}
                body={card.body}
              />
            );
          })}
        </div>
      </Section>

      {/* ---------- Beautiful tracking ---------- */}
      <Section
        id="tracking"
        eyebrow={dict.trackingSection.eyebrow}
        title={dict.trackingSection.title}
      >
        <p className="-mt-6 mb-10 max-w-xl text-fg-soft">{dict.trackingSection.intro}</p>
        <div className="grid gap-5 md:grid-cols-3">
          <TrackCard
            icon={<CalendarIcon className="h-5 w-5" />}
            title={dict.trackingSection.calendarTitle}
          >
            <MiniCalendar />
          </TrackCard>
          <TrackCard
            icon={<SparkIcon className="h-5 w-5" />}
            title={dict.trackingSection.predictionsTitle}
          >
            <div className="space-y-3">
              <div className="rounded-xl border border-line bg-night2 p-3">
                <p className="text-[11px] uppercase tracking-widest text-lock">
                  {dict.trackingSection.nextPeriod}
                </p>
                <p className="font-display text-lg font-semibold text-fg">
                  {dict.trackingSection.inDays}
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-lock to-highlight" />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-fg-soft">
                <span>{dict.trackingSection.fertileWindow}</span>
                <span className="text-fg">{dict.trackingSection.fertileDates}</span>
              </div>
            </div>
          </TrackCard>
          <TrackCard icon={<MoonIcon className="h-5 w-5" />} title={dict.trackingSection.moodTitle}>
            <div className="space-y-3">
              <div className="flex gap-2">
                {[35, 60, 45, 80, 55, 70, 90].map((heightPercent, index) => (
                  <div key={index} className="flex flex-1 items-end">
                    <div
                      className="w-full rounded-full bg-gradient-to-t from-lock/30 to-highlight"
                      style={{ height: `${heightPercent}%`, minHeight: 8 }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {dict.trackingSection.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-line px-2.5 py-1 text-[11px] text-fg-soft"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </TrackCard>
        </div>
      </Section>

      {/* ---------- Why Locklune (comparison) ---------- */}
      <Section id="why" eyebrow={dict.whySection.eyebrow} title={dict.whySection.title}>
        <div className="surface overflow-hidden">
          <div className="grid grid-cols-[1.4fr_1fr_1fr] border-b border-line text-sm">
            <div className="px-5 py-4 text-fg-muted" />
            <div className="flex items-center gap-2 px-5 py-4 font-display font-semibold text-fg">
              <MoonMark className="h-5 w-5" /> {site.name}
            </div>
            <div className="px-5 py-4 font-medium text-fg-muted">{dict.whySection.others}</div>
          </div>
          {dict.whySection.rows.map((row, index) => (
            <div
              key={row.label}
              className={`grid grid-cols-[1.4fr_1fr_1fr] items-center text-sm ${
                index % 2 ? 'bg-white/[0.015]' : ''
              }`}
            >
              <div className="px-5 py-4 text-fg-soft">{row.label}</div>
              <div className="flex items-center gap-2 px-5 py-4 text-fg">
                <CheckIcon className="h-4 w-4 shrink-0 text-success" />
                <span>{row.locklune}</span>
              </div>
              <div className="flex items-center gap-2 px-5 py-4 text-fg-muted">
                <XIcon className="h-4 w-4 shrink-0 text-fg-muted/70" />
                <span>{row.others}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ---------- Security ---------- */}
      <Section
        id="security"
        eyebrow={dict.securitySection.eyebrow}
        title={dict.securitySection.title}
      >
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div className="relative flex items-center justify-center py-8">
            <div
              className="absolute h-64 w-64 rounded-full blur-3xl"
              style={{
                background:
                  'radial-gradient(closest-side, rgba(138,162,255,0.3), rgba(138,162,255,0))',
              }}
            />
            <MoonMark className="relative h-56 w-56 drop-shadow-[0_20px_60px_rgba(138,162,255,0.35)]" />
          </div>
          <ul className="space-y-3">
            {dict.securitySection.items.map((feature, index) => {
              const Icon = securityIcons[index % securityIcons.length]!;
              return (
                <li
                  key={feature.title}
                  className="flex gap-4 rounded-2xl border border-line bg-card/40 p-4"
                >
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-lock/10 text-lock">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-medium text-fg">{feature.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-fg-muted">{feature.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </Section>

      {/* ---------- Download CTA ---------- */}
      <section id="download" className="mx-auto max-w-container px-6">
        <div className="surface relative overflow-hidden px-8 py-16 text-center">
          <div
            className="absolute inset-x-0 top-0 h-40"
            style={{
              background:
                'radial-gradient(60% 100% at 50% 0%, rgba(138,162,255,0.18), transparent)',
            }}
          />
          <MoonMark className="mx-auto h-12 w-12" />
          <h2 className="mx-auto mt-6 max-w-2xl font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            {dict.download.title}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-fg-soft">{dict.download.body}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={site.playStore}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-fg px-6 py-3 text-sm font-semibold text-night transition-transform hover:scale-[1.03]"
            >
              {dict.download.googlePlay}
            </a>
            {site.appStore && (
              <a
                href={site.appStore}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-fg px-6 py-3 text-sm font-semibold text-night transition-transform hover:scale-[1.03]"
              >
                {dict.download.appStore}
              </a>
            )}
            <Link
              href={`${base}/privacy`}
              className="rounded-full border border-line px-6 py-3 text-sm font-medium text-fg-soft transition-colors hover:text-fg"
            >
              {dict.download.readPrivacy}
            </Link>
          </div>
          <p className="mt-4 text-xs text-fg-muted">{dict.download.availability}</p>
        </div>
      </section>
    </>
  );
}

/* ---------- small building blocks ---------- */

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-container scroll-mt-24 px-6 py-24">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mb-12 mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="surface group p-6 transition-colors hover:border-white/15">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-lock/10 text-lock">
        {icon}
      </span>
      <h3 className="mt-5 font-display text-lg font-semibold text-fg">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">{body}</p>
    </div>
  );
}

function TrackCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="surface p-5">
      <div className="mb-4 flex items-center gap-2 text-fg-soft">
        <span className="text-lock">{icon}</span>
        <span className="text-sm font-medium text-fg">{title}</span>
      </div>
      {children}
    </div>
  );
}

function MiniCalendar() {
  const period = new Set([7, 8, 9, 10]);
  const today = 16;
  const days = Array.from({ length: 28 }, (_, index) => index + 1);
  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((dayNumber) => (
        <div key={dayNumber} className="flex aspect-square items-center justify-center">
          <span
            className={[
              'flex h-6 w-6 items-center justify-center rounded-full text-[10px]',
              period.has(dayNumber) ? 'bg-lock font-semibold text-night' : '',
              !period.has(dayNumber) && dayNumber === today ? 'ring-1 ring-moon text-fg' : '',
              !period.has(dayNumber) && dayNumber !== today ? 'text-fg-muted' : '',
            ].join(' ')}
          >
            {dayNumber}
          </span>
        </div>
      ))}
    </div>
  );
}
