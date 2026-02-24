import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "../pages/Welcome-screen";
import LoginScreen from "../pages/Auth/Login-screen";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
