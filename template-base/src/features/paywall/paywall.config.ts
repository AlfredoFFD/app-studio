/** Per-app paywall content. Swap copy/pricing per app — the engine is shared. */
export type Plan = {
  id: string;
  label: string;
  price: string;
  sub: string;
  badge?: string;
  highlighted?: boolean;
};

export const PAYWALL = {
  title: 'Unlock unlimited dances',
  subtitle: 'HD, watermark-free dance videos and every style.',
  perks: [
    'HD, watermark-free videos',
    'Unlimited dance generations',
    'All dance styles unlocked',
    'Priority rendering',
  ],
  plans: [
    {
      id: 'weekly',
      label: 'Weekly',
      price: '$6.99',
      sub: '3-day free trial, then $6.99 / week',
      highlighted: false,
    },
    {
      id: 'annual',
      label: 'Yearly',
      price: '$39.99',
      sub: '$3.33 / mo · billed yearly',
      badge: 'BEST VALUE · SAVE 89%',
      highlighted: true,
    },
  ] as Plan[],
  cta: 'Start 3-Day Free Trial',
  legal:
    'Cancel anytime. Payment is charged to your Apple ID. Subscription auto-renews unless canceled at least 24h before the end of the period.',
};
