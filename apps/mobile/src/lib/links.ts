import { BRAND } from '@locklune/core';
import { Linking, Share } from 'react-native';

/** Store listing used for ratings (update once the app is published). */
export const RATE_URL = BRAND.websiteUrl;

/** Contact / feedback form on the website. */
export const FEEDBACK_URL = `${BRAND.websiteUrl}/support`;

export function openLink(url: string): void {
  void Linking.openURL(url);
}

/** Native share sheet - word of mouth is the best free way to support a free app. */
export function shareApp(): void {
  void Share.share({
    message: `Locklune is a private, on-device period tracker with no accounts and no tracking. ${BRAND.websiteUrl}`,
  });
}
