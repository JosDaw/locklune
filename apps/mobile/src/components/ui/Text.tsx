import { type TextProps } from 'react-native';
import { Heading } from '../gs/heading';
import { Text as GSText } from '../gs/text';

export type TextVariant =
  | 'display'
  | 'heading'
  | 'title'
  | 'body'
  | 'muted'
  | 'faint'
  | 'label';

/**
 * App typography built on gluestack-ui's Heading/Text. Keeps a stable `variant`
 * API so screens don't care which gluestack primitive backs each style.
 */
export function Txt({
  variant = 'body',
  className,
  ...rest
}: Omit<TextProps, 'style'> & { variant?: TextVariant }) {
  const cls = (extra: string) => `${extra} ${className ?? ''}`;
  switch (variant) {
    case 'display':
      return <Heading size="3xl" className={cls('text-moon')} {...rest} />;
    case 'heading':
      return <Heading size="xl" className={cls('text-text')} {...rest} />;
    case 'title':
      return <Heading size="md" className={cls('text-text')} {...rest} />;
    case 'muted':
      return <GSText size="md" className={cls('text-text-muted')} {...rest} />;
    case 'faint':
      return <GSText size="sm" className={cls('text-text-faint')} {...rest} />;
    case 'label':
      return (
        <GSText
          size="xs"
          className={cls('text-text-muted font-semibold uppercase tracking-wider')}
          {...rest}
        />
      );
    case 'body':
    default:
      return <GSText size="md" className={cls('text-text')} {...rest} />;
  }
}
