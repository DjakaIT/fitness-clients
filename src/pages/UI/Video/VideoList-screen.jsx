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
          containerCardsStyle={styles.containerCards}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <VideoCard
              //TODO: fill the whole videos.js object file with names, ids, categories.
              video={item}
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
  containerCards: {
    paddingVertical: 20,
  },
});
