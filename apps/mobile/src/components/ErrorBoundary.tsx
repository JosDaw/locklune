import { Component, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { t } from '../i18n';
import { useAuthStore } from '../stores/authStore';
import { colors } from '../theme/colors';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches render errors anywhere below it and shows a calm, on-brand fallback
 * instead of a white screen. Deliberately built from plain primitives with inline
 * styles (no themed components that could themselves be the crash) and, true to
 * Locklune, it reports nothing anywhere - it just lets the user recover.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  private reset = () => this.setState({ error: null });

  private lock = () => {
    void useAuthStore.getState().lock();
    this.reset();
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t('errorBoundary.title')}</Text>
        <Text style={styles.body}>{t('errorBoundary.body')}</Text>
        <Pressable
          onPress={this.reset}
          accessibilityRole="button"
          accessibilityLabel={t('errorBoundary.tryAgain')}
          style={[styles.button, styles.primary]}
        >
          <Text style={styles.primaryLabel}>{t('errorBoundary.tryAgain')}</Text>
        </Pressable>
        <Pressable
          onPress={this.lock}
          accessibilityRole="button"
          accessibilityLabel={t('errorBoundary.lockApp')}
          style={[styles.button, styles.secondary]}
        >
          <Text style={styles.secondaryLabel}>{t('errorBoundary.lock')}</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    gap: 16,
  },
  title: { color: colors.text, fontSize: 22, fontWeight: '600', textAlign: 'center' },
  body: { color: colors.textMuted, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  button: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primary: { backgroundColor: colors.primary },
  primaryLabel: { color: colors.ink, fontSize: 16, fontWeight: '600' },
  secondary: { backgroundColor: colors.surfaceMuted },
  secondaryLabel: { color: colors.text, fontSize: 16, fontWeight: '600' },
} as const;
