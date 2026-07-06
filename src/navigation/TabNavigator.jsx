import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import BottomBar from "../components/BottomBar";
import HomeStackNavigator from "./HomeStackNavigator";
import ImpressionsScreen from "../pages/Impressions-screen";
import VideoStackNavigator from "./VideoStackNavigator";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        animation: "fade", // smooth crossfade between tabs
      }}
      tabBar={(props) => <BottomBar {...props} />}
      backBehavior="history"
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="VideoCategories" component={VideoStackNavigator} />
      <Tab.Screen name="Impressions" component={ImpressionsScreen} />
    </Tab.Navigator>
  );
}
