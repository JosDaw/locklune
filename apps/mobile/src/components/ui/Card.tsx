import { Card as GSCard } from '../gs/card';

/** Soft, lifted card — large radius and a gentle shadow over the moonlit backdrop. */
const cardShadow = {
  shadowColor: '#000000',
  shadowOpacity: 0.3,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 10 },
  elevation: 3,
} as const;

/** App card on top of gluestack-ui's Card, styled to the Locklune surface. */
export function Card({ className, ...rest }: Omit<React.ComponentProps<typeof GSCard>, 'variant'>) {
  return (
    <GSCard
      variant="outline"
      className={`rounded-3xl border border-border bg-surface p-6 ${className ?? ''}`}
      style={cardShadow}
      {...rest}
    />
  );
}
