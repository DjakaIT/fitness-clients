import React from "react";
import { View, StyleSheet, Dimensions, Text, ScrollView } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const PLAYER_HEIGHT = (width * 9) / 16;

export default function VideoScreen({ route }) {
  const { video } = route.params;

  if (!video?.youtubeID) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Video unavailable.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Centered Player */}
        <View style={styles.playerWrapper}>
          <YoutubePlayer
            height={PLAYER_HEIGHT}
            width={width - 32}
            videoId={video.youtubeID}
            play={false}
          />
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>{video.title}</Text>

          {video.category && (
            <Text style={styles.category}>{video.category}</Text>
          )}

          <View style={styles.divider} />

          {video.description && (
            <Text style={styles.description}>{video.description}</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  content: {
    paddingVertical: 32,
    alignItems: "center",
  },
  playerWrapper: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#000",
    elevation: 8,
  },
  infoSection: {
    width: "100%",
    paddingHorizontal: 24,
    marginTop: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  category: {
    marginTop: 6,
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#1E293B",
    marginVertical: 20,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#CBD5E1",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F172A",
  },
  errorText: {
    color: "#FFF",
  },
});
