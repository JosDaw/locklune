import { Button as GSButton, ButtonSpinner, ButtonText } from '../gs/button';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg';

const CONTAINER: Record<Variant, string> = {
  primary: 'bg-primary border-0',
  secondary: 'bg-surfaceMuted border border-border',
  ghost: 'bg-transparent border-0',
  danger: 'bg-transparent border border-danger',
};

const LABEL: Record<Variant, string> = {
  primary: 'text-ink',
  secondary: 'text-text',
  ghost: 'text-primary-soft',
  danger: 'text-danger',
};

/** App button on top of gluestack-ui's Button, themed to the Locklune palette. */
export function Button({
  title,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled,
  className,
  ...rest
}: Omit<React.ComponentProps<typeof GSButton>, 'variant' | 'size'> & {
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}) {
  const isDisabled = disabled || loading;
  return (
    <GSButton
      size={size}
      disabled={isDisabled}
      className={`rounded-2xl ${CONTAINER[variant]} ${isDisabled ? 'opacity-50' : ''} ${className ?? ''}`}
      {...rest}
    >
      {loading ? (
        <ButtonSpinner color={variant === 'primary' ? '#12101B' : '#ECE9F7'} />
      ) : (
        <ButtonText className={`font-semibold ${LABEL[variant]}`}>{title}</ButtonText>
      )}
    </GSButton>
  );
}
