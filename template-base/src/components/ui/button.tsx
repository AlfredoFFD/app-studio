import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  View,
} from 'react-native';

import { Gradients, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant = 'primary' | 'secondary' | 'ghost';

export type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
  left?: ReactNode;
};

/**
 * Factory design-system button. `primary` uses the brand gradient so every
 * app's main CTA feels premium with zero per-app styling work.
 */
export function Button({
  label,
  variant = 'primary',
  loading = false,
  fullWidth = true,
  left,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const content = (
    <View style={styles.row}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : theme.tint} />
      ) : (
        <>
          {left}
          <Text
            style={[
              styles.label,
              variant === 'primary' && { color: theme.onTint },
              variant === 'secondary' && { color: theme.text },
              variant === 'ghost' && { color: theme.tint },
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed }) => [
        fullWidth && styles.fullWidth,
        { opacity: isDisabled ? 0.5 : pressed ? 0.9 : 1 },
        typeof style === 'function' ? undefined : style,
      ]}
      {...rest}
    >
      {variant === 'primary' ? (
        <LinearGradient
          colors={Gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.base}
        >
          {content}
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.base,
            variant === 'secondary' && {
              backgroundColor: theme.backgroundElement,
              borderWidth: 1,
              borderColor: theme.border,
            },
          ]}
        >
          {content}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fullWidth: { alignSelf: 'stretch' },
  base: {
    height: 56,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  label: { fontSize: 17, fontWeight: '700', letterSpacing: 0.2 },
});
