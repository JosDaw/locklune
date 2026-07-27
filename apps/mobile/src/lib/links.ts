import { Linking, Share } from 'react-native';
import { BRAND } from '@locklune/core';

/** Personal site of Locklune's sole maker. */
export const MAKER_URL = 'https://constantlearning.org';

/** Ko-fi page for supporting the maker. */
export const KOFI_URL = 'https://ko-fi.com/constantlearning';

/** Store listing used for ratings (update once the app is published). */
export const RATE_URL = BRAND.websiteUrl;

export function openLink(url: string): void {
  void Linking.openURL(url);
}

/** Native share sheet — word of mouth is the best free way to support a free app. */
export function shareApp(): void {
  void Share.share({
    message: `Locklune is a private, on-device period tracker with no accounts and no tracking. ${BRAND.websiteUrl}`,
  });
}
