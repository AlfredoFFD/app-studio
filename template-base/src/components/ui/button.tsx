import * as Haptics from 'expo-haptics';
import { type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
  type PressableProps,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Glow, Radii, Spacing, Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const SPRING = { damping: 15, stiffness: 300 } as const;

type Variant = 'primary' | 'secondary' | 'ghost';

export type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
  left?: ReactNode;
};

/**
 * Factory design-system button. `primary` is a SOLID accent with an accent glow
 * (a confident solid + glow reads more premium than a gradient fill, which is
 * the templated tell). Spring-press + haptics on every tap.
 */
export function Button({
  label,
  variant = 'primary',
  loading = false,
  fullWidth = true,
  left,
  disabled,
  style,
  onPressIn,
  onPressOut,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handleIn = (e: GestureResponderEvent) => {
    scale.value = withSpring(0.96, SPRING);
    if (variant === 'primary') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onPressIn?.(e);
  };
  const handleOut = (e: GestureResponderEvent) => {
    scale.value = withSpring(1, SPRING);
    onPressOut?.(e);
  };

  const labelColor =
    variant === 'primary' ? theme.onTint : variant === 'secondary' ? theme.text : theme.tint;

  return (
    <AnimatedPressable
      disabled={isDisabled}
      onPressIn={handleIn}
      onPressOut={handleOut}
      style={[
        styles.base,
        fullWidth && styles.fullWidth,
        variant === 'primary' && { backgroundColor: theme.tint },
        variant === 'primary' && Glow.accent,
        variant === 'secondary' && {
          backgroundColor: theme.backgroundElement,
          borderWidth: 1,
          borderColor: theme.border,
        },
        animStyle,
        { opacity: isDisabled ? 0.5 : 1 },
        typeof style === 'function' ? undefined : style,
      ]}
      {...rest}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? '#fff' : theme.tint} />
        ) : (
          <>
            {left}
            <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
          </>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  fullWidth: { alignSelf: 'stretch' },
  base: {
    height: 54,
    borderRadius: Radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  label: { ...Type.button },
});
