import React, { useCallback, useMemo } from "react";
import { View, FlatList, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import VideoCard, { VideoCardSkeleton } from "../../../components/VideoCard";
import useVideos from "../../../hooks/useVideos";
import { makeStyles } from "../../../styles/UI/VideoStyles/StylesVideoList";
import { useTheme, useThemedStyles } from "../../../context/ThemeContext";

// Some categories are filmed wide with the athlete small in frame; the card
// zooms in so the movement stays readable.
const CATEGORY_ZOOM = { "Trbušni mišići": 1.8 };

const SKELETON_ROWS = [0, 1, 2, 3];

export default function VideoListScreen({ route, navigation }) {
  const { category } = route.params;
  const { videos: allVideos, loading } = useVideos();
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const videos = useMemo(
    () => allVideos.filter((v) => v.category === category),
    [allVideos, category],
  );
  const imageScale = CATEGORY_ZOOM[category] ?? 1;

  const renderItem = useCallback(
    ({ item }) => (
      <VideoCard
        title={item.title}
        youtubeID={item.youtubeID}
        imageScale={imageScale}
        onPress={() => navigation.navigate("Video", { video: item })}
      />
    ),
    [imageScale, navigation],
  );

  const Separator = useCallback(
    () => <View style={styles.separator} />,
    [styles.separator],
  );

  return (
    <View style={styles.container}>
      <StatusBar style={theme.statusBar} />
      {loading && videos.length === 0 ? (
        <View style={styles.listContent}>
          {SKELETON_ROWS.map((i) => (
            <View key={i} style={i > 0 && styles.separator}>
              <VideoCardSkeleton />
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={Separator}
          // The defaults render ~21 screens' worth of rows up front, so a
          // category fetched every thumbnail at once. Keep only what is near
          // the viewport; the rest loads as the list scrolls.
          initialNumToRender={5}
          maxToRenderPerBatch={4}
          windowSize={7}
          removeClippedSubviews={Platform.OS === "android"}
        />
      )}
    </View>
  );
}
