import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/lib/app-state';
import { PAYWALL } from './paywall.config';

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
      <Pressable onPress={() => router.back()} style={styles.close} hitSlop={12}>
        <Ionicons name="close" size={28} color={theme.textSecondary} />
      </Pressable>

      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{PAYWALL.title}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {PAYWALL.subtitle}
        </Text>
      </View>

      <View style={styles.perks}>
        {PAYWALL.perks.map((p) => (
          <View key={p} style={styles.perkRow}>
            <Ionicons name="checkmark-circle" size={22} color={theme.tint} />
            <Text style={[styles.perkText, { color: theme.text }]}>{p}</Text>
          </View>
        ))}
      </View>

      <View style={styles.plans}>
        {PAYWALL.plans.map((p) => {
          const selected = p.id === plan;
          return (
            <Pressable key={p.id} onPress={() => setPlan(p.id)}>
              <Card
                style={[
                  styles.plan,
                  { borderColor: selected ? theme.tint : theme.border, borderWidth: selected ? 2 : 1 },
                ]}
              >
                {p.badge ? (
                  <View style={[styles.badge, { backgroundColor: theme.tint }]}>
                    <Text style={styles.badgeText}>{p.badge}</Text>
                  </View>
                ) : null}
                <View style={styles.planRow}>
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

      <Button label={PAYWALL.cta} onPress={buy} />

      <View style={styles.linksRow}>
        <Pressable onPress={doRestore}>
          <Text style={[styles.link, { color: theme.textSecondary }]}>Restore</Text>
        </Pressable>
        <Text style={[styles.link, { color: theme.border }]}>·</Text>
        <Pressable onPress={() => Linking.openURL('https://example.com/terms')}>
          <Text style={[styles.link, { color: theme.textSecondary }]}>Terms</Text>
        </Pressable>
        <Text style={[styles.link, { color: theme.border }]}>·</Text>
        <Pressable onPress={() => Linking.openURL('https://example.com/privacy')}>
          <Text style={[styles.link, { color: theme.textSecondary }]}>Privacy</Text>
        </Pressable>
      </View>

      <Text style={[styles.legal, { color: theme.textSecondary }]}>{PAYWALL.legal}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  close: { alignSelf: 'flex-end', paddingVertical: Spacing.two },
  header: { gap: Spacing.two, marginBottom: Spacing.four },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 16, lineHeight: 22 },
  perks: { gap: Spacing.three, marginBottom: Spacing.five },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  perkText: { fontSize: 16, fontWeight: '600' },
  plans: { gap: Spacing.three, marginBottom: Spacing.four },
  plan: { paddingVertical: Spacing.three },
  planRow: { flexDirection: 'row', alignItems: 'center' },
  planLabel: { fontSize: 17, fontWeight: '700' },
  planSub: { fontSize: 13, marginTop: 2 },
  planPrice: { fontSize: 20, fontWeight: '800' },
  badge: {
    position: 'absolute',
    top: -10,
    right: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: Radii.sm,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  link: { fontSize: 13, fontWeight: '600' },
  legal: { fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: Spacing.three },
});
