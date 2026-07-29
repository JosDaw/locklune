import { PressScale } from './ui/PressScale';
import { Txt } from './ui/Text';

export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <PressScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      className={`rounded-full px-3.5 py-2 ${active ? 'bg-primary' : 'bg-surfaceMuted'}`}
    >
      <Txt className={active ? 'text-ink' : 'text-text-muted'}>{label}</Txt>
    </PressScale>
  );
}
