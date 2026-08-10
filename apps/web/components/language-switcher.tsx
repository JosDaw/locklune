'use client';

import { isLocale, locales } from '@/i18n/config';
import { Check as CheckIcon, Languages as LanguagesIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

/** Native display name for each supported locale. */
const NATIVE_NAME: Record<string, string> = {
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  ko: '한국어',
};

/**
 * Header dropdown that switches locale while keeping the current path. Reads the
 * pathname on the client, strips the leading locale segment, and links each
 * language to `/<locale><rest>`.
 */
export function LanguageSwitcher({ locale, label }: { locale: string; label: string }) {
  const pathname = usePathname() || '/';
  const [open, setOpen] = useState(false);

  const segments = pathname.split('/');
  const rest = isLocale(segments[1] ?? '') ? segments.slice(2).join('/') : '';
  const suffix = rest ? `/${rest}` : '';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-2 text-sm text-fg-soft transition-colors hover:text-fg"
      >
        <LanguagesIcon className="h-4 w-4" />
        <span>{NATIVE_NAME[locale] ?? locale.toUpperCase()}</span>
      </button>

      {open && (
        <>
          {/* Click-away layer */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 min-w-40 overflow-hidden rounded-2xl border border-line bg-night2 py-1 shadow-xl"
          >
            {locales.map((code) => {
              const active = code === locale;
              return (
                <Link
                  key={code}
                  href={`/${code}${suffix}`}
                  hrefLang={code}
                  role="menuitem"
                  aria-current={active ? 'true' : undefined}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between gap-3 px-4 py-2 text-sm transition-colors hover:bg-white/5 ${
                    active ? 'text-fg' : 'text-fg-soft'
                  }`}
                >
                  <span>{NATIVE_NAME[code]}</span>
                  {active && <CheckIcon className="h-4 w-4 text-lock" />}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
