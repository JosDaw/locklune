/**
 * Font-family name constants for inline styles (places that can't take a
 * className). Mirrors the fonts loaded in `src/app/_layout.tsx`.
 *
 * Korean glyphs aren't covered by Inter/Manrope, so for the `ko` locale we swap
 * the whole set to Nanum Gothic. `applyLocaleFonts()` (called from the i18n
 * layer) mutates the live `fonts` object in place so existing `fonts.*` reads
 * keep working; `Txt` uses `koFontForVariant` for its NativeWind-classed text.
 */
export type FontRole = 'regular' | 'medium' | 'semibold' | 'display' | 'displaySemibold';

const LATIN: Record<FontRole, string> = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  display: 'Manrope_700Bold',
  displaySemibold: 'Manrope_600SemiBold',
};

// Nanum Gothic ships Regular / Bold / ExtraBold - mapped onto our five roles.
const KOREAN: Record<FontRole, string> = {
  regular: 'NanumGothic_400Regular',
  medium: 'NanumGothic_400Regular',
  semibold: 'NanumGothic_700Bold',
  display: 'NanumGothic_800ExtraBold',
  displaySemibold: 'NanumGothic_700Bold',
};

/** Live map read by inline styles; mutated in place by `applyLocaleFonts`. */
export const fonts: Record<FontRole, string> = { ...LATIN };

/** Nanum family for each `Txt` variant (used only when the locale is Korean). */
export const koFontForVariant: Record<string, string> = {
  display: 'NanumGothic_800ExtraBold',
  heading: 'NanumGothic_700Bold',
  title: 'NanumGothic_700Bold',
  label: 'NanumGothic_700Bold',
  body: 'NanumGothic_400Regular',
  muted: 'NanumGothic_400Regular',
  faint: 'NanumGothic_400Regular',
};

/** Point the inline `fonts` map at the right family set for the active locale. */
export function applyLocaleFonts(locale: string): void {
  Object.assign(fonts, locale === 'ko' ? KOREAN : LATIN);
}
