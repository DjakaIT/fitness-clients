import VideoCard from "../../../components/VideoCard";
import { View, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getVideosByCategory } from "../../../../backend/data/videos";

export default function VideoScreen({ route, navigation }) {
  const { category } = route.params;
  const videos = getVideosByCategory(category);

  return (
    <>
      <SafeAreaView style={styles.container}>
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VideoCard
              video={item}
              onPress={() => navigation.navigate("Video", { video: item })}
            />
          )}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
});
