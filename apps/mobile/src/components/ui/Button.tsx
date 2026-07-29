import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import type { StyleProp, ViewStyle } from 'react-native';
import { Button as GSButton, ButtonSpinner, ButtonText } from '../gs/button';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg';

const SPRING = { damping: 18, stiffness: 350, mass: 0.5 } as const;

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
  containerStyle,
  onPressIn: callerPressIn,
  onPressOut: callerPressOut,
  ...rest
}: Omit<React.ComponentProps<typeof GSButton>, 'variant' | 'size'> & {
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const isDisabled = disabled || loading;

  return (
    <Animated.View style={[anim, containerStyle]}>
      <GSButton
        size={size}
        disabled={isDisabled}
        className={`rounded-2xl ${CONTAINER[variant]} ${isDisabled ? 'opacity-50' : ''} ${className ?? ''}`}
        onPressIn={(e) => {
          if (!isDisabled) scale.value = withSpring(0.97, SPRING);
          callerPressIn?.(e);
        }}
        onPressOut={(e) => {
          scale.value = withSpring(1, SPRING);
          callerPressOut?.(e);
        }}
        {...rest}
      >
        {loading ? (
          <ButtonSpinner color={variant === 'primary' ? '#0F172A' : '#F8FAFC'} />
        ) : (
          <ButtonText className={`font-semibold ${LABEL[variant]}`}>{title}</ButtonText>
        )}
      </GSButton>
    </Animated.View>
  );
}
