import VideoCard from "../../../components/VideoCard";
import { View, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getVideosByCategory } from "../../../../backend/data/videos";

export default function VideoScreen({ route, navigation }) {
  const { category } = route.params;
  const videos = getVideosByCategory(category);

  const imageScale = category === "Trbušni mišići" ? 1.8 : 1.0;

  return (
    <>
      <SafeAreaView style={styles.container}>
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
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  separator: {
    height: 20,
  },
  listContent: {
    paddingTop: 20,
    paddingBottom: 100, // enough space to clear the BottomBar
  },
});
