import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * Minimal app state for the template: onboarding + subscription flags.
 *
 * TODAY: in-memory only (resets on reload) — keeps the app 100% Expo-Go-safe
 * for the demo. No native storage module needed.
 *
 * LATER (dev build): swap these setters to persist with
 * `@react-native-async-storage/async-storage`, and replace `isSubscribed`
 * with RevenueCat's `CustomerInfo.entitlements.active` listener.
 */
type AppState = {
  hasOnboarded: boolean;
  isSubscribed: boolean;
  completeOnboarding: () => void;
  subscribe: () => void;
  restore: () => void;
  reset: () => void;
};

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const value = useMemo<AppState>(
    () => ({
      hasOnboarded,
      isSubscribed,
      completeOnboarding: () => setHasOnboarded(true),
      subscribe: () => setIsSubscribed(true), // STUB: real purchase via RevenueCat in dev build
      restore: () => setIsSubscribed(true), // STUB: Purchases.restorePurchases()
      reset: () => {
        setHasOnboarded(false);
        setIsSubscribed(false);
      },
    }),
    [hasOnboarded, isSubscribed],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
