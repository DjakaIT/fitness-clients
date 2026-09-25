import React, { memo } from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { Play } from "phosphor-react-native";
import PressableScale from "./PressableScale";
import Skeleton from "./Skeleton";
import { makeStyles } from "../styles/Components/StylesVideoCard";
import { useTheme, useThemedStyles } from "../context/ThemeContext";
import { thumbnailFor } from "../utils/youtube";

/**
 * One exercise in the category list.
 *
 * The whole card is the target now — previously only the small "Pogledaj" pill
 * responded, so most taps on a card did nothing. The pill stays as a visual
 * affordance. The thumbnail is cached to disk and fades in, so a second visit
 * is instant and a first visit never pops in over a bare grey box.
 */
function VideoCard({ title, youtubeID, onPress, imageScale = 1 }) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const thumb = thumbnailFor(youtubeID, imageScale);

  return (
    <View style={styles.wrapper}>
      <PressableScale
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${title}, pogledaj video`}
        style={styles.card}
      >
        <View style={styles.imageContainer}>
          {thumb && (
            <Image
              source={thumb.uri}
              style={[styles.image, { transform: [{ scale: thumb.scale }] }]}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={180}
              recyclingKey={youtubeID}
              accessible={false}
            />
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={3}>
            {title}
          </Text>

          <View style={styles.button} importantForAccessibility="no">
            <Play size={18} weight="fill" color={theme.onAccent} />
            <Text style={styles.buttonText}>Pogledaj</Text>
          </View>
        </View>
      </PressableScale>
    </View>
  );
}

export default memo(VideoCard);

/** Same footprint as a card, so the list does not jump when data lands. */
export function VideoCardSkeleton() {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <Skeleton style={styles.imageContainer} radius={20} />
        <View style={styles.content}>
          <View>
            <Skeleton style={{ height: 20, width: "90%" }} radius={8} />
            <Skeleton
              style={{ height: 20, width: "60%", marginTop: 8 }}
              radius={8}
            />
          </View>
          <Skeleton style={{ height: 44, width: 128 }} radius={999} />
        </View>
      </View>
    </View>
  );
}
