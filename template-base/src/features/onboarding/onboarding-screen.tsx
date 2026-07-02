import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { EqBars } from '@/components/ui/eq-bars';
import { Fonts, Gradients, Radii, Spacing, Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/lib/app-state';
import { ONBOARDING_SLIDES, type OnboardingSlide } from './onboarding.config';

/**
 * Config-driven onboarding ENGINE (shared across the factory).
 * Conversion flow: hook -> micro-commitment (style pick) -> proof -> a short
 * "personalizing" loader -> paywall (day-0 offer, the highest-converting slot).
 */
export function OnboardingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { completeOnboarding, setPreferredStyle, preferredStyle } = useAppState();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const ref = useRef<ScrollView>(null);
  const slides = ONBOARDING_SLIDES;
  const slide = slides[index];
  const isLoader = slide?.kind === 'loader';

  const finish = () => {
    completeOnboarding();
    router.replace('/home');
    router.push('/paywall'); // day-0 offer on top of home
  };

  const next = () => {
    if (index >= slides.length - 1) return finish();
    ref.current?.scrollTo({ x: width * (index + 1), animated: true });
    setIndex((i) => i + 1);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <LinearGradient colors={Gradients.washDark} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          ref={ref}
          horizontal
          pagingEnabled
          scrollEnabled={!isLoader}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
          scrollEventThrottle={16}
        >
          {slides.map((s, i) => (
            <View key={i} style={[styles.slide, { width }]}>
              <Slide
                slide={s}
                active={i === index}
                pickedStyle={preferredStyle}
                onPick={setPreferredStyle}
                onLoaderDone={finish}
              />
            </View>
          ))}
        </ScrollView>

        {!isLoader && (
          <View style={styles.footer}>
            <View style={styles.dots}>
              {slides.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    { backgroundColor: i === index ? theme.tint : theme.border, width: i === index ? 22 : 8 },
                  ]}
                />
              ))}
            </View>
            <Button label={index === slides.length - 2 ? 'Set up my studio' : 'Continue'} onPress={next} />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

function Slide({
  slide,
  active,
  pickedStyle,
  onPick,
  onLoaderDone,
}: {
  slide: OnboardingSlide;
  active: boolean;
  pickedStyle: string | null;
  onPick: (id: string) => void;
  onLoaderDone: () => void;
}) {
  const theme = useTheme();

  if (slide.kind === 'loader') {
    return <LoaderSlide title={slide.title} lines={slide.lines} active={active} onDone={onLoaderDone} />;
  }

  return (
    <>
      <View style={[styles.emojiWrap, { backgroundColor: theme.accentSoft }]}>
        <Text style={styles.emoji}>{slide.icon}</Text>
      </View>
      <Text style={[styles.title, { color: theme.text }]}>{slide.title}</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{slide.subtitle}</Text>

      {slide.kind === 'choice' && (
        <View style={styles.choiceGrid}>
          {slide.choices.map((c) => {
            const sel = pickedStyle === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => onPick(c.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: sel }}
                accessibilityLabel={`Choose ${c.label} style`}
                style={[
                  styles.choice,
                  {
                    backgroundColor: sel ? theme.accentSoft : theme.backgroundElement,
                    borderColor: sel ? theme.tint : theme.border,
                  },
                ]}
              >
                <Text style={styles.choiceEmoji}>{c.emoji}</Text>
                <Text style={[styles.choiceLabel, { color: sel ? theme.tint : theme.text }]}>{c.label}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {slide.kind === 'proof' && (
        <View style={styles.points}>
          {slide.points.map((p) => (
            <View key={p} style={styles.pointRow}>
              <View style={[styles.pointDot, { backgroundColor: theme.tint }]} />
              <Text style={[styles.pointText, { color: theme.text }]}>{p}</Text>
            </View>
          ))}
        </View>
      )}
    </>
  );
}

function LoaderSlide({
  title,
  lines,
  active,
  onDone,
}: {
  title: string;
  lines: string[];
  active: boolean;
  onDone: () => void;
}) {
  const theme = useTheme();
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    if (!active) return;
    const stepMs = 900;
    const interval = setInterval(() => setLineIndex((i) => Math.min(i + 1, lines.length - 1)), stepMs);
    const done = setTimeout(onDone, stepMs * lines.length + 400);
    return () => {
      clearInterval(interval);
      clearTimeout(done);
    };
  }, [active, lines.length, onDone]);

  return (
    <View style={styles.loaderWrap}>
      <EqBars size={44} />
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{lines[lineIndex]}</Text>
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
    width: 116,
    height: 116,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 58 },
  title: { ...Type.h1, textAlign: 'center' },
  subtitle: { ...Type.body, textAlign: 'center', maxWidth: 320 },
  choiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.two,
    maxWidth: 340,
  },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radii.chip,
    borderWidth: 1,
  },
  choiceEmoji: { fontSize: 16 },
  choiceLabel: { fontFamily: Fonts.bodySemi, fontSize: 14 },
  points: { gap: Spacing.three, maxWidth: 320 },
  pointRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  pointDot: { width: 6, height: 6, borderRadius: 3, marginTop: 8 },
  pointText: { fontFamily: Fonts.bodyMedium, fontSize: 15, lineHeight: 22, flex: 1 },
  loaderWrap: { alignItems: 'center', gap: Spacing.four },
  footer: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.three, gap: Spacing.four },
  dots: { flexDirection: 'row', gap: Spacing.one, justifyContent: 'center', alignItems: 'center' },
  dot: { height: 8, borderRadius: 4 },
});
