import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useStackScreenOptions } from "./navigationConfig";
import HomeScreen from "../pages/UI/Home-screen";
import MyWorkoutsScreen from "../pages/UI/InPerson/MyWorkoutsScreen";
import VideoScreen from "../pages/UI/Video/Video-screen";
import ProgressScreen from "../pages/UI/Progress/ProgressScreen";
import CheckInScreen from "../pages/UI/Progress/CheckInScreen";

const Stack = createNativeStackNavigator();

export default function HomeStackNavigator() {
  const screenOptions = useStackScreenOptions();
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="MyWorkouts" component={MyWorkoutsScreen} />
      <Stack.Screen name="WorkoutVideo" component={VideoScreen} />
      <Stack.Screen name="Progress" component={ProgressScreen} />
      <Stack.Screen name="CheckIn" component={CheckInScreen} />
    </Stack.Navigator>
  );
}
