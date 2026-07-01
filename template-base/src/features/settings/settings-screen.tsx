import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/lib/app-state';

function Row({
  icon,
  label,
  onPress,
  right,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  right?: string;
  last?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress}>
      <View
        style={[
          styles.row,
          { borderBottomColor: theme.border, borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth },
        ]}
      >
        <Ionicons name={icon} size={20} color={theme.textSecondary} />
        <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
        <View style={{ flex: 1 }} />
        {right ? (
          <Text style={{ color: theme.textSecondary }}>{right}</Text>
        ) : (
          <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
        )}
      </View>
    </Pressable>
  );
}

export function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { isSubscribed, restore, reset } = useAppState();

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        <View style={{ width: 26 }} />
      </View>

      <Card style={styles.card}>
        <Row
          icon="star"
          label="Subscription"
          right={isSubscribed ? 'Active' : 'Free'}
          onPress={() => !isSubscribed && router.push('/paywall')}
        />
        <Row icon="refresh" label="Restore purchases" onPress={restore} />
        <Row
          icon="document-text"
          label="Terms of Use"
          onPress={() => Linking.openURL('https://example.com/terms')}
        />
        <Row
          icon="shield-checkmark"
          label="Privacy Policy"
          onPress={() => Linking.openURL('https://example.com/privacy')}
        />
        <Row
          icon="trash"
          label="Reset demo (onboarding + sub)"
          last
          onPress={() => {
            reset();
            router.replace('/');
          }}
        />
      </Card>

      <Text style={[styles.footer, { color: theme.textSecondary }]}>
        App Studio · template-base v0.1 · app #001 AI Dance
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: Spacing.three,
  },
  title: { fontSize: 20, fontWeight: '800' },
  card: { paddingVertical: 0, paddingHorizontal: Spacing.four },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.three },
  rowLabel: { fontSize: 16, fontWeight: '600' },
  footer: { fontSize: 12, textAlign: 'center', marginTop: Spacing.four },
});
