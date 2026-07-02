import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { Fonts, Radii, Spacing, Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/lib/app-state';
import { PAYWALL } from './paywall.config';

/**
 * Config-driven paywall ENGINE (shared across the factory).
 * Structure (conversion-ordered): kicker + hero -> free/pro comparison ->
 * plans (annual default) -> trial timeline -> CTA -> proof -> restore/legal.
 * Purchase is a STUB until RevenueCat lands in the dev build.
 */
export function PaywallScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { subscribe, restore } = useAppState();
  const [plan, setPlan] = useState<string>(
    PAYWALL.plans.find((p) => p.highlighted)?.id ?? PAYWALL.plans[0].id,
  );

  const buy = () => {
    // STUB: in a dev build this calls Purchases.purchasePackage(selectedPackage)
    subscribe();
    router.back();
  };
  const doRestore = () => {
    restore();
    router.back();
  };

  return (
    <Screen scroll>
      <Pressable
        onPress={() => router.back()}
        style={styles.close}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Close"
      >
        <Ionicons name="close" size={28} color={theme.textSecondary} />
      </Pressable>

      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.tint }]}>{PAYWALL.kicker}</Text>
        <Text style={[styles.title, { color: theme.text }]}>{PAYWALL.title}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{PAYWALL.subtitle}</Text>
      </View>

      {/* Free vs Pro comparison */}
      <Card style={styles.compareCard}>
        <View style={styles.compareHead}>
          <Text style={[styles.compareFeatureHead, { color: theme.textSecondary }]}>What you get</Text>
          <Text style={[styles.compareColHead, { color: theme.textSecondary }]}>Free</Text>
          <Text style={[styles.compareColHead, { color: theme.tint }]}>Pro</Text>
        </View>
        {PAYWALL.compare.map((row) => (
          <View key={row.feature} style={styles.compareRow}>
            <Text style={[styles.compareFeature, { color: theme.text }]}>{row.feature}</Text>
            <View style={styles.compareCol}>
              <Ionicons
                name={row.free ? 'checkmark' : 'remove'}
                size={18}
                color={row.free ? theme.textSecondary : theme.textTertiary}
              />
            </View>
            <View style={styles.compareCol}>
              <Ionicons name={row.pro ? 'checkmark-circle' : 'remove'} size={18} color={theme.tint} />
            </View>
          </View>
        ))}
      </Card>

      {/* Plans */}
      <View style={styles.plans}>
        {PAYWALL.plans.map((p) => {
          const selected = p.id === plan;
          return (
            <Pressable
              key={p.id}
              onPress={() => setPlan(p.id)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${p.label} plan, ${p.price}`}
            >
              <Card
                style={[
                  styles.plan,
                  { borderColor: selected ? theme.tint : theme.border, borderWidth: selected ? 1.5 : 1 },
                ]}
              >
                {p.badge ? (
                  <View style={[styles.badge, { backgroundColor: theme.tint }]}>
                    <Text style={styles.badgeText}>{p.badge}</Text>
                  </View>
                ) : null}
                <View style={styles.planRow}>
                  <View
                    style={[
                      styles.radio,
                      { borderColor: selected ? theme.tint : theme.border },
                      selected && { backgroundColor: theme.tint },
                    ]}
                  >
                    {selected && <Ionicons name="checkmark" size={12} color={theme.onTint} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.planLabel, { color: theme.text }]}>{p.label}</Text>
                    <Text style={[styles.planSub, { color: theme.textSecondary }]}>{p.sub}</Text>
                  </View>
                  <Text style={[styles.planPrice, { color: theme.text }]}>{p.price}</Text>
                </View>
              </Card>
            </Pressable>
          );
        })}
      </View>

      {/* Trial timeline */}
      <View style={styles.trial}>
        {PAYWALL.trial.map((t, i) => (
          <View key={t.day} style={styles.trialRow}>
            <View style={styles.trialRail}>
              <View style={[styles.trialDot, { backgroundColor: i === 0 ? theme.tint : theme.borderStrong }]} />
              {i < PAYWALL.trial.length - 1 && (
                <View style={[styles.trialLine, { backgroundColor: theme.borderStrong }]} />
              )}
            </View>
            <View style={styles.trialBody}>
              <Text style={[styles.trialDay, { color: i === 0 ? theme.tint : theme.text }]}>{t.day}</Text>
              <Text style={[styles.trialText, { color: theme.textSecondary }]}>{t.text}</Text>
            </View>
          </View>
        ))}
      </View>

      <Button label={PAYWALL.cta} onPress={buy} />
      <Text style={[styles.ctaSub, { color: theme.textSecondary }]}>{PAYWALL.ctaSub}</Text>

      <Text style={[styles.proof, { color: theme.textTertiary }]}>{PAYWALL.proofLine}</Text>

      <View style={styles.linksRow}>
        <Pressable onPress={doRestore} hitSlop={10} accessibilityRole="button">
          <Text style={[styles.link, { color: theme.textSecondary }]}>Restore</Text>
        </Pressable>
        <Text style={[styles.link, { color: theme.border }]}>·</Text>
        <Pressable onPress={() => Linking.openURL('https://example.com/terms')} hitSlop={10} accessibilityRole="link">
          <Text style={[styles.link, { color: theme.textSecondary }]}>Terms</Text>
        </Pressable>
        <Text style={[styles.link, { color: theme.border }]}>·</Text>
        <Pressable onPress={() => Linking.openURL('https://example.com/privacy')} hitSlop={10} accessibilityRole="link">
          <Text style={[styles.link, { color: theme.textSecondary }]}>Privacy</Text>
        </Pressable>
      </View>

      <Text style={[styles.legal, { color: theme.textTertiary }]}>{PAYWALL.legal}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  close: { alignSelf: 'flex-end', paddingVertical: Spacing.two },
  header: { gap: Spacing.one, marginBottom: Spacing.four },
  kicker: { ...Type.kicker },
  title: { ...Type.h1 },
  subtitle: { ...Type.body, marginTop: 2 },
  compareCard: { marginBottom: Spacing.four, paddingVertical: Spacing.three, gap: Spacing.two },
  compareHead: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.one },
  compareFeatureHead: { ...Type.caption, flex: 1 },
  compareColHead: { fontFamily: Fonts.utility, fontSize: 11, letterSpacing: 1, width: 44, textAlign: 'center' },
  compareRow: { flexDirection: 'row', alignItems: 'center', minHeight: 26 },
  compareFeature: { fontFamily: Fonts.bodyMedium, fontSize: 14, flex: 1 },
  compareCol: { width: 44, alignItems: 'center' },
  plans: { gap: Spacing.three, marginBottom: Spacing.four },
  plan: { paddingVertical: Spacing.three },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planLabel: { ...Type.title },
  planSub: { ...Type.caption, marginTop: 2 },
  planPrice: { ...Type.price },
  badge: {
    position: 'absolute',
    top: -10,
    right: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: Radii.sm,
  },
  badgeText: { color: '#fff', fontFamily: Fonts.utility, fontSize: 10, letterSpacing: 0.6 },
  trial: { marginBottom: Spacing.four, gap: 0 },
  trialRow: { flexDirection: 'row', gap: Spacing.three },
  trialRail: { alignItems: 'center', width: 14 },
  trialDot: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  trialLine: { width: 2, flex: 1, marginVertical: 2 },
  trialBody: { flex: 1, paddingBottom: Spacing.three },
  trialDay: { fontFamily: Fonts.bodySemi, fontSize: 14 },
  trialText: { ...Type.caption, marginTop: 1 },
  ctaSub: { ...Type.caption, textAlign: 'center', marginTop: Spacing.two },
  proof: { ...Type.caption, textAlign: 'center', marginTop: Spacing.four },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.three,
    minHeight: 44,
  },
  link: { fontFamily: Fonts.bodySemi, fontSize: 13 },
  legal: { fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: Spacing.one, marginBottom: Spacing.three },
});
