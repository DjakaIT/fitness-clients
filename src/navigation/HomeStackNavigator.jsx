import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { sharedScreenOptions } from "./navigationConfig";
import HomeScreen from "../pages/UI/Home-screen";
import MyWorkoutsScreen from "../pages/UI/InPerson/MyWorkoutsScreen";
import VideoScreen from "../pages/UI/Video/Video-screen";

const Stack = createNativeStackNavigator();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={sharedScreenOptions}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="MyWorkouts" component={MyWorkoutsScreen} />
      <Stack.Screen name="WorkoutVideo" component={VideoScreen} />
    </Stack.Navigator>
  );
}
