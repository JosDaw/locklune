import Image from 'next/image';
import { type SVGProps } from 'react';

/** The Locklune mark: a crescent moon with a small keyhole and a gold star. */
export function MoonMark({
  title = 'Locklune',
  ...props
}: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="ll-moon" x1="0.2" y1="0.1" x2="0.8" y2="0.95">
          <stop offset="0" stopColor="#F8FAFC" />
          <stop offset="0.6" stopColor="#E2E8F0" />
          <stop offset="1" stopColor="#AFC8FF" />
        </linearGradient>
        <linearGradient id="ll-lock" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8FC0FF" />
          <stop offset="1" stopColor="#6B82E6" />
        </linearGradient>
        <mask id="ll-crescent">
          <rect width="48" height="48" fill="black" />
          <circle cx="21" cy="24" r="16.5" fill="white" />
          <circle cx="31" cy="18" r="15.5" fill="black" />
        </mask>
      </defs>
      {/* crescent */}
      <g mask="url(#ll-crescent)">
        <rect width="48" height="48" fill="url(#ll-moon)" />
      </g>
      {/* gold star near the opening */}
      <path
        d="M36 12.5 l0.9 2.1 2.3 0.3 -1.7 1.6 0.4 2.3 -1.9 -1.1 -1.9 1.1 0.4 -2.3 -1.7 -1.6 2.3 -0.3 Z"
        fill="#FFD166"
      />
      {/* padlock */}
      <path
        d="M21.5 25.5 v-2.1 a2.5 2.5 0 0 1 5 0 v2.1"
        fill="none"
        stroke="#AFC8FF"
        strokeWidth="1.7"
      />
      <rect x="19" y="25.2" width="10" height="8.4" rx="2.1" fill="url(#ll-lock)" />
      <circle cx="24" cy="28.6" r="1.1" fill="#0F172A" />
      <rect x="23.45" y="29" width="1.1" height="2.5" rx="0.55" fill="#0F172A" />
    </svg>
  );
}

/** Wordmark + icon lockup (uses the app icon image). */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src="/locklune-icon.png"
        alt=""
        width={32}
        height={32}
        className="h-8 w-8 rounded-lg"
        priority
      />
      <span className="font-display text-lg font-semibold tracking-tight text-fg">Locklune</span>
    </span>
  );
}
