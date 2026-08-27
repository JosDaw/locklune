import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import type { StyleProp, ViewStyle } from 'react-native';
import { Button as GSButton, ButtonSpinner, ButtonText } from '../gs/button';
import { colors } from '../../theme/colors';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'md' | 'lg';

const SPRING = { damping: 18, stiffness: 350, mass: 0.5 } as const;

const CONTAINER: Record<Variant, string> = {
  primary: 'bg-primary border-0',
  secondary: 'bg-surfaceMuted border border-border',
  outline: 'bg-transparent border border-primary',
  ghost: 'bg-transparent border-0',
  danger: 'bg-transparent border border-danger',
};

const LABEL: Record<Variant, string> = {
  primary: 'text-ink',
  secondary: 'text-text',
  outline: 'text-primary-soft',
  ghost: 'text-primary-soft',
  danger: 'text-danger',
};

// Icon tint per variant, matching the LABEL text colour above.
const ICON_COLOR: Record<Variant, string> = {
  primary: colors.ink,
  secondary: colors.text,
  outline: colors.primarySoft,
  ghost: colors.primarySoft,
  danger: colors.danger,
};

/** App button on top of gluestack-ui's Button, themed to the Locklune palette. */
export function Button({
  title,
  variant = 'primary',
  size = 'lg',
  loading = false,
  icon,
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
  icon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: StyleProp<ViewStyle>;
}) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const reduceMotion = useReducedMotion();
  const isDisabled = disabled || loading;

  return (
    <Animated.View style={[anim, containerStyle]}>
      <GSButton
        size={size}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: !!isDisabled, busy: loading }}
        className={`rounded-2xl ${CONTAINER[variant]} ${isDisabled ? 'opacity-50' : ''} ${className ?? ''}`}
        onPressIn={(event) => {
          if (!isDisabled && !reduceMotion) scale.value = withSpring(0.97, SPRING);
          callerPressIn?.(event);
        }}
        onPressOut={(event) => {
          scale.value = withSpring(1, SPRING);
          callerPressOut?.(event);
        }}
        {...rest}
      >
        {loading ? (
          <ButtonSpinner color={variant === 'primary' ? '#0F172A' : '#F8FAFC'} />
        ) : (
          <>
            {icon && <Ionicons name={icon} size={18} color={ICON_COLOR[variant]} />}
            <ButtonText className={`text-center font-semibold ${LABEL[variant]}`}>
              {title}
            </ButtonText>
          </>
        )}
      </GSButton>
    </Animated.View>
  );
}
