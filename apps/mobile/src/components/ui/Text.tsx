import { type TextProps } from 'react-native';
import { Heading } from '../gs/heading';
import { Text as GSText } from '../gs/text';
import { useLocale } from '../../i18n';
import { koFontForVariant } from '../../theme/fonts';

export type TextVariant = 'display' | 'heading' | 'title' | 'body' | 'muted' | 'faint' | 'label';

/**
 * App typography built on gluestack-ui's Heading/Text. Keeps a stable `variant`
 * API so screens don't care which gluestack primitive backs each style.
 *
 * For Korean, the NativeWind font classes (Inter/Manrope) lack Hangul glyphs, so
 * we override with the matching Nanum family via `style`. Other locales are
 * untouched - the className font wins.
 */
export function Txt({
  variant = 'body',
  className,
  ...rest
}: Omit<TextProps, 'style'> & { variant?: TextVariant }) {
  const locale = useLocale();
  const cls = (extra: string) => `${extra} ${className ?? ''}`;
  const koStyle = locale === 'ko' ? { fontFamily: koFontForVariant[variant] } : undefined;
  switch (variant) {
    case 'display':
      return (
        <Heading
          size="3xl"
          accessibilityRole="header"
          className={cls('text-moon font-display')}
          style={koStyle}
          {...rest}
        />
      );
    case 'heading':
      return (
        <Heading
          size="xl"
          accessibilityRole="header"
          className={cls('text-text font-heading')}
          style={koStyle}
          {...rest}
        />
      );
    case 'title':
      return (
        <Heading
          size="md"
          accessibilityRole="header"
          className={cls('text-text font-heading')}
          style={koStyle}
          {...rest}
        />
      );
    case 'muted':
      return (
        <GSText size="md" className={cls('text-text-muted font-body')} style={koStyle} {...rest} />
      );
    case 'faint':
      return (
        <GSText size="sm" className={cls('text-text-faint font-body')} style={koStyle} {...rest} />
      );
    case 'label':
      return (
        <GSText
          size="xs"
          className={cls('text-text-muted font-body-semibold uppercase tracking-wider')}
          style={koStyle}
          {...rest}
        />
      );
    case 'body':
    default:
      return <GSText size="md" className={cls('text-text font-body')} style={koStyle} {...rest} />;
  }
}
