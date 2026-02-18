import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

import WelcomeScreen from "./src/pages/Welcome-screen";
import LoginScreen from "./src/pages/Auth/Login-screen";
import RegisterScreen from "./src/pages/Auth/Register-screen";
import HomeScreen from "./src/pages/UI/Home-screen";
import VideoCategories from "./src/pages/UI/Video/VideoCategories-screen";
import ImpressionsScreen from "./src/pages/Impressions-screen";
import VideoScreen from "./src/pages/UI/Video/VideoList-screen";
import BottomBar from "./src/components/BottomBar";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="VideoCategories" component={VideoCategories} />
      <Tab.Screen name="Video" component={VideoScreen} />
      <Tab.Screen name="Impressions" component={ImpressionsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
