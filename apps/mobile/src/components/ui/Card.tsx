import { Card as GSCard } from '../gs/card';

/** App card on top of gluestack-ui's Card, styled to the Locklune surface. */
export function Card({
  className,
  ...rest
}: Omit<React.ComponentProps<typeof GSCard>, 'variant'>) {
  return (
    <GSCard
      variant="outline"
      className={`rounded-2xl border border-border bg-surface p-5 ${className ?? ''}`}
      {...rest}
    />
  );
}
