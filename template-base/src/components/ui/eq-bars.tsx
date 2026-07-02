import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';

/**
 * Equalizer bars — the app's music motif, used wherever the app is "listening
 * to the beat" (onboarding loader, render wait). One ambient loop at a time on
 * screen; static bars when the user prefers reduced motion.
 */
export function EqBars({ size = 28, color }: { size?: number; color?: string }) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const barColor = color ?? theme.tint;
  const heights = [0.45, 0.8, 0.6, 1, 0.5];

  return (
    <View style={[styles.row, { height: size }]} accessibilityElementsHidden>
      {heights.map((h, i) => (
        <Bar key={i} maxHeight={size} peak={h} delay={i * 110} color={barColor} animate={!reduced} />
      ))}
    </View>
  );
}

function Bar({
  maxHeight,
  peak,
  delay,
  color,
  animate,
}: {
  maxHeight: number;
  peak: number;
  delay: number;
  color: string;
  animate: boolean;
}) {
  const v = useSharedValue(peak * 0.4);

  useEffect(() => {
    if (!animate) {
      v.value = peak * 0.7;
      return;
    }
    v.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(peak, { duration: 380, easing: Easing.inOut(Easing.quad) }),
          withTiming(peak * 0.35, { duration: 380, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        true,
      ),
    );
  }, [animate, delay, peak, v]);

  const style = useAnimatedStyle(() => ({ height: v.value * maxHeight }));

  return <Animated.View style={[styles.bar, { backgroundColor: color }, style]} />;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  bar: { width: 5, borderRadius: 3 },
});
