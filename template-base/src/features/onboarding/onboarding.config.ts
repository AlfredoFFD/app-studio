/**
 * Per-app onboarding content. Swap copy/icons per app — the engine is shared.
 *
 * Slide kinds (conversion flow, in order):
 *  - feature: hook slides (what the app does)
 *  - choice:  micro-commitment — user picks something, we personalize
 *  - proof:   credibility (KEEP CLAIMS TRUE — swap in real ratings post-launch)
 *  - loader:  "personalizing" beat that makes the pick feel used, then paywall
 */
export type OnboardingSlide =
  | { kind: 'feature'; icon: string; title: string; subtitle: string }
  | {
      kind: 'choice';
      icon: string;
      title: string;
      subtitle: string;
      choices: { id: string; label: string; emoji: string }[];
    }
  | { kind: 'proof'; icon: string; title: string; subtitle: string; points: string[] }
  | { kind: 'loader'; title: string; lines: string[] };

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    kind: 'feature',
    icon: '💃',
    title: 'Make anything dance',
    subtitle: 'Turn any photo into a studio-quality dance video. Your selfie, your pet, anyone.',
  },
  {
    kind: 'choice',
    icon: '🎬',
    title: 'Pick your vibe',
    subtitle: 'We tune your feed around it. You can switch any time.',
    choices: [
      { id: 'sway', label: 'Viral Sway', emoji: '🕺' },
      { id: 'anime', label: 'Anime You', emoji: '🌸' },
      { id: 'zombie', label: 'Zombie', emoji: '🧟' },
      { id: 'kpop', label: 'K-Pop', emoji: '✨' },
      { id: 'salsa', label: 'Salsa', emoji: '💃' },
      { id: 'disco', label: 'Disco', emoji: '🪩' },
    ],
  },
  {
    kind: 'proof',
    icon: '🚀',
    title: 'Built to go viral',
    subtitle: 'Post it straight to your feed in HD.',
    // NOTE: keep every claim true. Swap in real ratings/user counts after launch.
    points: [
      'Powered by Kling 3.0, the engine behind millions of viral clips',
      'Full-body choreography from a single photo',
      'Save to Photos or share to any app in one tap',
    ],
  },
  {
    kind: 'loader',
    title: 'Setting up your studio',
    lines: ['Reading your vibe...', 'Warming up the stage...', 'Choreographing your first moves...'],
  },
];
