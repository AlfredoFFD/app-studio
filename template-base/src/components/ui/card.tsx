import { StyleSheet, View, type ViewProps } from 'react-native';

import { Glow, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Card({ style, ...rest }: ViewProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        // brighter top edge = faked light-from-above (spatial depth)
        { backgroundColor: theme.card, borderColor: theme.border, borderTopColor: 'rgba(255,255,255,0.12)' },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.four,
    ...Glow.card,
  },
});
