import { createNativeStackNavigator } from "@react-navigation/native-stack";
import VideoCategories from "../pages/UI/Video/VideoCategories-screen";
import VideoScreen from "../pages/UI/Video/VideoList-screen";

const Stack = createNativeStackNavigator();

export default function VideoStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VideoCategoriesScreen" component={VideoCategories} />
      <Stack.Screen name="VideoList" component={VideoScreen} />
    </Stack.Navigator>
  );
}
