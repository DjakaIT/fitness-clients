import React from "react";
import { View, Dimensions, Text, ScrollView } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../../styles/VideoStyles/StylesVideoScreen";

const { width } = Dimensions.get("window");
const PLAYER_HEIGHT = (width * 9) / 16;

export default function VideoScreen({ route }) {
  const { video } = route.params;

  if (!video?.youtubeID) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Video nedostupan.</Text>
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
