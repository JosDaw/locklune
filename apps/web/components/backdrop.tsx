// Deterministic star field (no randomness → no hydration mismatch).
const STARS: { x: number; y: number; r: number; gold?: boolean; twinkle?: boolean }[] = [
  { x: 6, y: 14, r: 1.1, gold: true, twinkle: true },
  { x: 14, y: 40, r: 0.8 },
  { x: 22, y: 8, r: 1, twinkle: true },
  { x: 30, y: 26, r: 0.7, gold: true },
  { x: 41, y: 12, r: 0.9 },
  { x: 48, y: 33, r: 0.7, twinkle: true },
  { x: 58, y: 9, r: 1.2, gold: true, twinkle: true },
  { x: 66, y: 30, r: 0.8 },
  { x: 73, y: 16, r: 0.9, gold: true },
  { x: 82, y: 40, r: 0.7, twinkle: true },
  { x: 90, y: 12, r: 1, gold: true },
  { x: 94, y: 30, r: 0.8, twinkle: true },
  { x: 12, y: 62, r: 0.7 },
  { x: 36, y: 54, r: 0.8, gold: true },
  { x: 70, y: 58, r: 0.7, twinkle: true },
  { x: 88, y: 62, r: 0.9, gold: true },
];

// A soft, unobtrusive constellation.
const CONSTELLATION = [
  { x: 58, y: 9 },
  { x: 66, y: 30 },
  { x: 73, y: 16 },
  { x: 82, y: 40 },
];

export function Backdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden noise"
      aria-hidden="true"
    >
      {/* blurred moon glow */}
      <div
        className="absolute left-1/2 top-[-14rem] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full blur-[120px]"
        style={{
          background: 'radial-gradient(closest-side, rgba(138,162,255,0.28), rgba(138,162,255,0))',
        }}
      />
      <div
        className="absolute right-[-10rem] top-[6rem] h-[28rem] w-[28rem] rounded-full blur-[130px]"
        style={{
          background: 'radial-gradient(closest-side, rgba(175,200,255,0.14), rgba(175,200,255,0))',
        }}
      />
      {/* fade to background at the bottom of the hero */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-night" />

      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 70"
      >
        {CONSTELLATION.map((p, i) =>
          i === 0 ? null : (
            <line
              key={i}
              x1={CONSTELLATION[i - 1]!.x}
              y1={CONSTELLATION[i - 1]!.y}
              x2={p.x}
              y2={p.y}
              stroke="rgba(255,255,255,0.10)"
              strokeWidth={0.15}
            />
          ),
        )}
        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill={s.gold ? '#FFD166' : '#E2E8F0'}
            className={s.twinkle ? 'animate-twinkle' : ''}
            opacity={s.twinkle ? undefined : 0.5}
          />
        ))}
      </svg>
    </div>
  );
}
