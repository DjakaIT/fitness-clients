import VideoCard from "../../../components/VideoCard";
import { View, FlatList } from "react-native";
import { getVideosByCategory } from "../../../../backend/data/videos";
import { styles } from "../../../styles/UI/VideoStyles/StylesVideoList";

export default function VideoScreen({ route, navigation }) {
  const { category } = route.params;
  const videos = getVideosByCategory(category);

  const imageScale = category === "Trbušni mišići" ? 1.8 : 1.0;

  return (
    <>
      <View style={styles.container}>
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
    </>
  );
}
