/** Per-app onboarding content. Swap copy/icons per app — the engine is shared. */
export type OnboardingSlide = {
  icon: string;
  title: string;
  subtitle: string;
};

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    icon: '💃',
    title: 'Make anything dance',
    subtitle: 'Turn any photo — your selfie, your pet, anyone — into a viral dance video.',
  },
  {
    icon: '🎬',
    title: 'Pick your vibe',
    subtitle: 'Hip-hop, salsa, disco, or full makeovers: become anime, a 3D toon, even a zombie.',
  },
  {
    icon: '🚀',
    title: 'Post & go viral',
    subtitle: 'Export in HD, no watermark, and drop it straight on your feed.',
  },
];
