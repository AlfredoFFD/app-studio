import { Ionicons } from '@expo/vector-icons';
import { File, Paths } from 'expo-file-system';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { Fonts, Glow, Radii, Spacing, Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/lib/app-state';
import { generateDance, type GenResult } from '@/lib/generate';

/**
 * APP #001 CORE FEATURE — the swappable layer.
 * Real path: fal.ai Kling image-to-video via the proxy (EXPO_PUBLIC_API_URL) → plays the video.
 * Fallback (no proxy): animates the user's photo as a "preview" so the app still demos offline.
 */

// `makeover: true` = appearance transformation (stylize then animate, ~2 min).
const DANCE_STYLES = [
  { id: 'sway', label: 'Viral Sway', emoji: '🕺' },
  { id: 'anime', label: 'Anime You', emoji: '🌸', makeover: true },
  { id: 'zombie', label: 'Zombie', emoji: '🧟', makeover: true },
  { id: 'toon', label: '3D Toon', emoji: '🎬', makeover: true },
  { id: 'painting', label: 'Old Painting', emoji: '🖼️', makeover: true },
  { id: 'hiphop', label: 'Hip-Hop', emoji: '🎧' },
  { id: 'kpop', label: 'K-Pop', emoji: '✨' },
  { id: 'ballet', label: 'Ballet', emoji: '🩰' },
  { id: 'salsa', label: 'Salsa', emoji: '💃' },
  { id: 'breakdance', label: 'Breakdance', emoji: '🔥' },
  { id: 'robot', label: 'Robot', emoji: '🤖' },
  { id: 'disco', label: 'Disco', emoji: '🪩' },
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
  const [actionBusy, setActionBusy] = useState<'save' | 'share' | null>(null);

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
  const isMakeover = !!DANCE_STYLES.find((s) => s.id === style)?.makeover;

  // Download the finished video to cache once, then hand it to Photos / the share sheet.
  const fetchLocalVideo = async () => {
    const target = new File(Paths.cache, `dance-${Date.now()}.mp4`);
    const file = await File.downloadFileAsync(videoUrl as string, target);
    return file.uri;
  };

  const saveVideo = async () => {
    if (!videoUrl) return;
    setActionBusy('save');
    setError(null);
    try {
      const perm = await MediaLibrary.requestPermissionsAsync(true);
      if (!perm.granted) throw new Error('Allow photo access in Settings to save your dance');
      const uri = await fetchLocalVideo();
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Saved!', 'Your dance video is in your Photos.');
    } catch (e: any) {
      setError(e?.message || 'Save failed');
    } finally {
      setActionBusy(null);
    }
  };

  const shareVideo = async () => {
    if (!videoUrl) return;
    setActionBusy('share');
    setError(null);
    try {
      if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is not available on this device');
      const uri = await fetchLocalVideo();
      await Sharing.shareAsync(uri, { mimeType: 'video/mp4', UTI: 'public.movie' });
    } catch (e: any) {
      setError(e?.message || 'Share failed');
    } finally {
      setActionBusy(null);
    }
  };

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

      <Pressable onPress={pick} style={[styles.stageWrap, result ? Glow.accent : null]}>
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
                  backgroundColor: sel ? theme.accentSoft : theme.backgroundElement,
                  borderColor: sel ? theme.tint : theme.border,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: sel ? theme.tint : theme.text }]}>
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

      {videoUrl && isSubscribed && (
        <View style={styles.actions}>
          <Button
            label="Save"
            variant="secondary"
            loading={actionBusy === 'save'}
            disabled={!!actionBusy}
            onPress={saveVideo}
            style={{ flex: 1 }}
          />
          <Button
            label="Share"
            loading={actionBusy === 'share'}
            disabled={!!actionBusy}
            onPress={shareVideo}
            style={{ flex: 1 }}
          />
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
          ? isMakeover
            ? 'Giving you a makeover, then choreographing it in studio quality. Grab a coffee, 3 to 6 minutes...'
            : 'Choreographing your full-body dance in studio quality. Usually 2 to 5 minutes...'
          : 'Studio-quality full-body dance video. Worth the couple minutes it takes.'}
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
  kicker: { ...Type.kicker },
  h1: { ...Type.h1, marginTop: 4 },
  sub: { ...Type.body, marginTop: Spacing.two, marginBottom: Spacing.four },
  stageWrap: { width: '100%' },
  stage: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: Radii.stage,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { alignItems: 'center', gap: Spacing.two },
  emptyText: { fontFamily: Fonts.bodySemi, fontSize: 14 },
  note1: { position: 'absolute', top: 14, left: 16, fontSize: 26 },
  note2: { position: 'absolute', top: 36, right: 18, fontSize: 22 },
  scrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 90 },
  stageLabel: {
    position: 'absolute',
    left: Spacing.three,
    bottom: Spacing.three,
    color: '#fff',
    fontFamily: Fonts.display,
    fontSize: 15,
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
  chipText: { fontFamily: Fonts.bodySemi, fontSize: 14 },
  error: { fontFamily: Fonts.bodySemi, fontSize: 14, textAlign: 'center', marginTop: Spacing.three },
  actions: { flexDirection: 'row', gap: Spacing.three, marginTop: Spacing.four },
  hint: { ...Type.caption, textAlign: 'center', marginTop: Spacing.three },
});
