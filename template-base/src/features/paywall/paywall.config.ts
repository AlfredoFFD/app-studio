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
  kicker: 'AI DANCE PRO',
  title: 'Unlock every dance',
  subtitle: 'HD, watermark-free, all 12 styles.',
  // Free vs Pro comparison — the "what am I paying for" table.
  compare: [
    { feature: 'Watermark-free videos', free: false, pro: true },
    { feature: 'HD studio quality', free: false, pro: true },
    { feature: 'All 12 styles + makeovers', free: false, pro: true },
    { feature: 'Save and share anywhere', free: false, pro: true },
    { feature: 'Preview any style', free: true, pro: true },
  ],
  plans: [
    {
      id: 'weekly',
      label: 'Weekly',
      price: '$6.99',
      sub: 'Billed weekly. Cancel anytime.',
      highlighted: false,
    },
    {
      id: 'annual',
      label: 'Yearly',
      price: '$39.99',
      sub: '$0.77 a week, billed once a year',
      badge: 'BEST VALUE',
      highlighted: true,
    },
  ] as Plan[],
  // How the free trial works — reduces trial anxiety, lifts starts.
  trial: [
    { day: 'Today', text: 'Full access unlocked. Make your first HD dance.' },
    { day: 'Day 2', text: 'We remind you before anything is charged.' },
    { day: 'Day 3', text: 'Trial ends. Cancel before this in one tap.' },
  ],
  // KEEP CLAIMS TRUE — swap in real ratings after launch.
  proofLine: 'Rendered by Kling 3.0, the engine behind millions of viral clips',
  cta: 'Start my free trial',
  ctaSub: 'Free for 3 days. No charge if you cancel.',
  legal:
    'Cancel anytime. Payment is charged to your Apple ID. Subscription auto-renews unless canceled at least 24h before the end of the period.',
};
