import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  View,
  Text,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import YoutubePlayer from "react-native-youtube-iframe";
import {
  CaretLeftIcon,
  CheckCircleIcon,
  WarningCircleIcon,
  ArrowsLeftRightIcon,
  PlayIcon,
} from "phosphor-react-native";
import PressableScale from "../../../components/PressableScale";
import useVideos from "../../../hooks/useVideos";
import useReducedMotion from "../../../hooks/useReducedMotion";
import { useTheme, useThemedStyles } from "../../../context/ThemeContext";
import { makeStyles } from "../../../styles/UI/VideoStyles/StylesVideoScreen";
import { space } from "../../../styles/clientTheme";
import { useNativeDriver, DURATIONS } from "../../../styles/motion";
import { heroFor } from "../../../utils/youtube";
import { normalizeTips, TIP_KINDS } from "../../../utils/exerciseTips";

// The player is a WebView — the heaviest thing in the app. Mounting it while
// the push animation is still running is what made opening a video stutter.
// It waits for the transition to finish; this is the ceiling if the
// transition event never arrives (first screen, reduced motion, etc.).
const PLAYER_MOUNT_FALLBACK_MS = 500;

const TIP_ICON = {
  form: CheckCircleIcon,
  mistake: WarningCircleIcon,
  alternative: ArrowsLeftRightIcon,
};

export default function VideoScreen({ route, navigation }) {
  const { video: fromRoute } = route.params ?? {};
  const { byId } = useVideos();
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const reducedMotion = useReducedMotion();
  const { width } = useWindowDimensions();

  // Prefer the live catalogue entry, so tips edited by the trainer show up
  // without the client having to leave and come back.
  const video = byId.get(String(fromRoute?.id)) ?? fromRoute;
  const tips = normalizeTips(video?.tips);

  const [mountPlayer, setMountPlayer] = useState(false);
  const posterOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const unsubscribe = navigation.addListener("transitionEnd", (e) => {
      if (!e?.data?.closing) setMountPlayer(true);
    });
    const fallback = setTimeout(
      () => setMountPlayer(true),
      PLAYER_MOUNT_FALLBACK_MS,
    );
    return () => {
      unsubscribe();
      clearTimeout(fallback);
    };
  }, [navigation]);

  // The poster stays over the player until it is actually ready, then fades.
  // Without it the stage flashes black while the WebView boots.
  const onPlayerReady = () => {
    if (reducedMotion) {
      posterOpacity.setValue(0);
      return;
    }
    Animated.timing(posterOpacity, {
      toValue: 0,
      duration: DURATIONS.backdrop,
      useNativeDriver,
    }).start();
  };

  if (!video?.youtubeID) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Video nedostupan.</Text>
      </View>
    );
  }

  const playerHeight = ((width - space.md * 2) * 9) / 16;

  return (
    <View style={styles.screen}>
      <StatusBar style={theme.statusBar} />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <PressableScale
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Natrag"
              hitSlop={10}
            >
              <CaretLeftIcon size={20} color={theme.textPrimary} />
            </PressableScale>
          </View>

          <View style={styles.player}>
            {mountPlayer && (
              <YoutubePlayer
                height={playerHeight}
                videoId={video.youtubeID}
                play={false}
                onReady={onPlayerReady}
                initialPlayerParams={{ rel: false, modestbranding: true }}
              />
            )}
            <Animated.View
              pointerEvents="none"
              style={[styles.poster, { opacity: posterOpacity }]}
            >
              <Image
                source={heroFor(video.youtubeID)}
                style={styles.poster}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={150}
                accessible={false}
              />
              <View style={styles.posterPlay}>
                <View style={styles.posterPlayDisc}>
                  <PlayIcon size={26} weight="fill" color="#FFFFFF" />
                </View>
              </View>
            </Animated.View>
          </View>

          <View style={styles.header}>
            {!!video.category && (
              <Text style={styles.category}>{video.category}</Text>
            )}
            <Text style={styles.title} accessibilityRole="header">
              {video.title}
            </Text>
          </View>

          {tips.length > 0 && (
            <>
              <Text style={styles.tipsLabel}>Savjeti</Text>
              <View style={styles.tipsCard}>
                {tips.map((tip, i) => {
                  const Icon = TIP_ICON[tip.type];
                  return (
                    <View key={`${tip.type}-${i}`}>
                      {i > 0 && <View style={styles.tipDivider} />}
                      <View
                        style={styles.tipRow}
                        accessible
                        accessibilityLabel={`${TIP_KINDS[tip.type].label}: ${tip.text}`}
                      >
                        <View style={styles.tipIcon}>
                          <Icon
                            size={16}
                            weight="bold"
                            color={
                              tip.type === "mistake"
                                ? theme.danger
                                : theme.accent
                            }
                          />
                        </View>
                        <View style={styles.tipBody}>
                          <Text style={styles.tipKind}>
                            {TIP_KINDS[tip.type].label}
                          </Text>
                          <Text style={styles.tipText}>{tip.text}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
