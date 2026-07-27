import { MoonMark } from './logo';

// A representative month: which day numbers are period / predicted / today.
const PERIOD = new Set([6, 7, 8, 9, 10]);
const PREDICTED = new Set([2, 3, 4]); // early-next-cycle window shown faintly
const TODAY = 17;
const DAYS = Array.from({ length: 35 }, (_, i) => i - 2); // leading blanks < 1

function Cell({ n }: { n: number }) {
  if (n < 1) return <div className="aspect-square" />;
  const isPeriod = PERIOD.has(n);
  const isPredicted = PREDICTED.has(n);
  const isToday = n === TODAY;
  return (
    <div className="flex aspect-square items-center justify-center">
      <div
        className={[
          'flex h-6 w-6 items-center justify-center rounded-full text-[10px]',
          isPeriod ? 'bg-lock text-night font-semibold' : '',
          !isPeriod && isPredicted ? 'border border-lock/60 text-highlight' : '',
          !isPeriod && !isPredicted && isToday ? 'ring-1 ring-moon text-fg' : '',
          !isPeriod && !isPredicted && !isToday ? 'text-fg-muted' : '',
        ].join(' ')}
      >
        {n}
      </div>
    </div>
  );
}

/** Static, stylized "Today" screen inside a floating phone frame. */
export function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[248px] sm:w-[268px]">
      {/* moonlight glow behind the phone */}
      <div
        className="absolute -inset-10 -z-10 rounded-[3rem] blur-3xl"
        style={{ background: 'radial-gradient(closest-side, rgba(110,168,254,0.35), rgba(110,168,254,0))' }}
      />
      <div className="animate-floaty rounded-[2.6rem] border border-line bg-night2 p-3 shadow-[0_50px_120px_-30px_rgba(0,0,0,0.85)]">
        <div className="relative overflow-hidden rounded-[2rem] border border-line bg-night">
          {/* notch */}
          <div className="absolute left-1/2 top-2 h-1.5 w-16 -translate-x-1/2 rounded-full bg-white/10" />

          <div className="space-y-4 px-4 pb-5 pt-8">
            {/* header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-fg-muted">Thursday · Jul 17</p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <MoonMark className="h-4 w-4" />
                  <span className="font-display text-sm font-semibold text-fg">Locklune</span>
                </div>
              </div>
              <div className="h-7 w-7 rounded-full border border-line bg-card" />
            </div>

            {/* next period card */}
            <div className="rounded-2xl border border-line bg-card/70 p-3.5">
              <p className="text-[10px] uppercase tracking-widest text-lock">Next period</p>
              <p className="mt-1 font-display text-xl font-semibold text-fg">in 6 days</p>
              <p className="mt-0.5 text-[11px] text-fg-soft">Jul 23 · window Jul 21–25</p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-lock to-highlight" />
              </div>
            </div>

            {/* calendar */}
            <div className="rounded-2xl border border-line bg-card/50 p-3">
              <div className="mb-1.5 grid grid-cols-7 text-center text-[9px] text-fg-muted">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {DAYS.map((n, i) => (
                  <Cell key={i} n={n} />
                ))}
              </div>
            </div>

            {/* insight row */}
            <div className="flex items-center justify-between rounded-2xl border border-line bg-card/40 px-3.5 py-2.5">
              <span className="text-[11px] text-fg-soft">Cycle length</span>
              <span className="text-[11px] font-semibold text-fg">28 days · high confidence</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
