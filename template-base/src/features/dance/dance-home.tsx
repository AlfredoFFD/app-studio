import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/lib/app-state';
import { generateDance, type GenResult } from '@/lib/generate';

/**
 * APP #001 CORE FEATURE — the swappable layer.
 * Real path: fal.ai Kling image-to-video via the proxy (EXPO_PUBLIC_API_URL) → plays the video.
 * Fallback (no proxy): animates the user's photo as a "preview" so the app still demos offline.
 */

const DANCE_STYLES = [
  { id: 'sway', label: 'Viral Sway', emoji: '🕺' },
  { id: 'hiphop', label: 'Hip-Hop', emoji: '🎧' },
  { id: 'kpop', label: 'K-Pop', emoji: '✨' },
  { id: 'ballet', label: 'Ballet', emoji: '🩰' },
  { id: 'anime', label: 'Anime', emoji: '🌀' },
  { id: 'zombie', label: 'Zombie', emoji: '🧟' },
];

export function DanceHome() {
  const theme = useTheme();
  const router = useRouter();
  const { isSubscribed } = useAppState();
  const [photo, setPhoto] = useState<string | null>(null);
  const [style, setStyle] = useState('sway');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoUrl = result?.videoUrl ?? null;
  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = true;
    p.muted = true;
  });
  useEffect(() => {
    if (videoUrl) {
      try {
        player.play();
      } catch {}
    }
  }, [videoUrl, player]);

  // Mock fallback: sway the photo when we got a result but no real video (proxy off).
  const showMock = !!result && !videoUrl && !!photo;
  const sway = useSharedValue(0);
  useEffect(() => {
    if (showMock) {
      sway.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 480, easing: Easing.inOut(Easing.quad) }),
          withTiming(-1, { duration: 480, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        true,
      );
    } else {
      sway.value = 0;
    }
  }, [showMock, sway]);
  const danceAnim = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${sway.value * 3}deg` },
      { translateY: -Math.abs(sway.value) * 8 },
      { scale: 1 + Math.abs(sway.value) * 0.02 },
    ],
  }));

  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.7,
    });
    if (!res.canceled && res.assets[0]) {
      setPhoto(res.assets[0].uri);
      setResult(null);
      setError(null);
    }
  };

  const generate = async () => {
    if (!photo) return;
    setResult(null);
    setError(null);
    setLoading(true);
    try {
      const r = await generateDance(photo, style);
      setResult(r);
    } catch (e: any) {
      setError(e?.message === 'Aborted' ? 'Timed out — try again' : e?.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const styleLabel = DANCE_STYLES.find((s) => s.id === style)?.label;

  return (
    <Screen scroll>
      <View style={styles.header}>
        <View>
          <Text style={[styles.kicker, { color: theme.tint }]}>AI DANCE</Text>
          <Text style={[styles.h1, { color: theme.text }]}>Make anything dance 💃</Text>
        </View>
        <Pressable onPress={() => router.push('/settings')} hitSlop={10}>
          <Ionicons name="settings-outline" size={24} color={theme.textSecondary} />
        </Pressable>
      </View>
      <Text style={[styles.sub, { color: theme.textSecondary }]}>
        Drop a photo — your pet, your selfie, anyone — and watch it bust a move.
      </Text>

      <Pressable onPress={pick} style={styles.stageWrap}>
        <View
          style={[styles.stage, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
        >
          {videoUrl ? (
            <VideoView
              player={player}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              nativeControls={false}
            />
          ) : photo ? (
            <Animated.View style={[StyleSheet.absoluteFill, showMock ? danceAnim : undefined]}>
              <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} contentFit="cover" />
            </Animated.View>
          ) : (
            <View style={styles.empty}>
              <Ionicons name="image-outline" size={40} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Tap to add a photo</Text>
            </View>
          )}

          {result && (
            <>
              <Text style={styles.note1}>🎵</Text>
              <Text style={styles.note2}>🎶</Text>
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={styles.scrim} />
              <Text style={styles.stageLabel}>{styleLabel} dance</Text>
              {!isSubscribed && <Text style={styles.watermark}>PREVIEW</Text>}
            </>
          )}
        </View>
      </Pressable>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {DANCE_STYLES.map((s) => {
          const sel = s.id === style;
          return (
            <Pressable
              key={s.id}
              onPress={() => setStyle(s.id)}
              style={[
                styles.chip,
                {
                  backgroundColor: sel ? theme.tint : theme.backgroundElement,
                  borderColor: sel ? theme.tint : theme.border,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: sel ? theme.onTint : theme.text }]}>
                {s.emoji}  {s.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {error && <Text style={[styles.error, { color: '#EF4444' }]}>⚠️ {error}</Text>}

      {result && !isSubscribed && (
        <Button
          label="Unlock full HD dance ✨"
          onPress={() => router.push('/paywall')}
          style={{ marginTop: Spacing.four }}
        />
      )}

      {result && isSubscribed && (
        <View style={styles.actions}>
          <Button label="Save" variant="secondary" onPress={() => {}} style={{ flex: 1 }} />
          <Button label="Share" onPress={() => {}} style={{ flex: 1 }} />
        </View>
      )}

      <Button
        label={loading ? 'Choreographing…' : result ? 'Regenerate' : 'Generate dance'}
        loading={loading}
        disabled={!photo}
        onPress={generate}
        style={{ marginTop: Spacing.three }}
      />
      <Text style={[styles.hint, { color: theme.textSecondary }]}>
        {loading
          ? 'Kling is animating your photo — about a minute…'
          : 'Powered by fal.ai Kling · a real dance video takes ~1 min'}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: Spacing.two,
  },
  kicker: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  h1: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5, marginTop: 2 },
  sub: { fontSize: 16, lineHeight: 22, marginTop: Spacing.two, marginBottom: Spacing.four },
  stageWrap: { width: '100%' },
  stage: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { alignItems: 'center', gap: Spacing.two },
  emptyText: { fontSize: 14, fontWeight: '600' },
  note1: { position: 'absolute', top: 14, left: 16, fontSize: 26 },
  note2: { position: 'absolute', top: 36, right: 18, fontSize: 22 },
  scrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 90 },
  stageLabel: {
    position: 'absolute',
    left: Spacing.three,
    bottom: Spacing.three,
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  watermark: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '42%',
    textAlign: 'center',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 46,
    fontWeight: '900',
    letterSpacing: 4,
    transform: [{ rotate: '-18deg' }],
  },
  chips: { gap: Spacing.two, paddingVertical: Spacing.three, paddingRight: Spacing.three },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radii.pill,
    borderWidth: 1,
  },
  chipText: { fontSize: 14, fontWeight: '700' },
  error: { fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: Spacing.three },
  actions: { flexDirection: 'row', gap: Spacing.three, marginTop: Spacing.four },
  hint: { fontSize: 12, textAlign: 'center', marginTop: Spacing.three },
});
