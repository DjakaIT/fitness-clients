import { createNativeStackNavigator } from "@react-navigation/native-stack";
import VideoCategories from "../pages/UI/Video/VideoCategories-screen";
import VideoListScreen from "../pages/UI/Video/VideoList-screen";
import VideoScreen from "../pages/UI/Video/Video-screen";
import { sharedScreenOptions } from "./navigationConfig";

const Stack = createNativeStackNavigator();

export default function VideoStackNavigator() {
  return (
    <Stack.Navigator screenOptions={sharedScreenOptions}>
      <Stack.Screen name="VideoCategoriesScreen" component={VideoCategories} />
      <Stack.Screen name="VideoList" component={VideoListScreen} />
      <Stack.Screen name="Video" component={VideoScreen} />
    </Stack.Navigator>
  );
}
