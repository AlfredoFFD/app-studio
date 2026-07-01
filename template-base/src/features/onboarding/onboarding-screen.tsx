import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Gradients, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/lib/app-state';
import { ONBOARDING_SLIDES } from './onboarding.config';

export function OnboardingScreen() {
  const theme = useTheme();
  const scheme = useColorScheme();
  const router = useRouter();
  const { completeOnboarding } = useAppState();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const ref = useRef<ScrollView>(null);
  const isLast = index === ONBOARDING_SLIDES.length - 1;

  const next = () => {
    if (isLast) {
      completeOnboarding();
      router.replace('/home');
      return;
    }
    ref.current?.scrollTo({ x: width * (index + 1), animated: true });
    setIndex((i) => i + 1);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <LinearGradient
        colors={scheme === 'dark' ? Gradients.washDark : Gradients.wash}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          ref={ref}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) =>
            setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
          }
          scrollEventThrottle={16}
        >
          {ONBOARDING_SLIDES.map((s, i) => (
            <View key={i} style={[styles.slide, { width }]}>
              <View style={[styles.emojiWrap, { backgroundColor: theme.accentSoft }]}>
                <Text style={styles.emoji}>{s.icon}</Text>
              </View>
              <Text style={[styles.title, { color: theme.text }]}>{s.title}</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                {s.subtitle}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.dots}>
            {ONBOARDING_SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === index ? theme.tint : theme.border,
                    width: i === index ? 22 : 8,
                  },
                ]}
              />
            ))}
          </View>
          <Button label={isLast ? 'Get Started' : 'Continue'} onPress={next} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.five,
    gap: Spacing.four,
  },
  emojiWrap: {
    width: 132,
    height: 132,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 68 },
  title: { fontSize: 30, fontWeight: '800', textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { fontSize: 16, lineHeight: 24, textAlign: 'center', maxWidth: 320 },
  footer: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.three, gap: Spacing.four },
  dots: { flexDirection: 'row', gap: Spacing.one, justifyContent: 'center', alignItems: 'center' },
  dot: { height: 8, borderRadius: 4 },
});
