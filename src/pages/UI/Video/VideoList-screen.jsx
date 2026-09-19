import { View, FlatList, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import VideoCard from "../../../components/VideoCard";
import useVideos from "../../../hooks/useVideos";
import { makeStyles } from "../../../styles/UI/VideoStyles/StylesVideoList";
import { useTheme, useThemedStyles } from "../../../context/ThemeContext";

export default function VideoScreen({ route, navigation }) {
  const { category } = route.params;
  const { videos: allVideos, loading } = useVideos();
  const videos = allVideos.filter((v) => v.category === category);
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const imageScale = category === "Trbušni mišići" ? 1.8 : 1.0;

  return (
    <View style={styles.container}>
      <StatusBar style={theme.statusBar} />
      {loading && (
        <ActivityIndicator
          size="large"
          color={theme.accent}
          style={{ marginTop: 40 }}
        />
      )}
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <VideoCard
            video={item}
            imageScale={imageScale}
            title={item.title}
            image={`https://img.youtube.com/vi/${item.youtubeID}/maxresdefault.jpg`}
            onPress={() => navigation.navigate("Video", { video: item })}
          />
        )}
      />
    </View>
  );
}
