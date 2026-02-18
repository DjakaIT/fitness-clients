import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "../pages/Welcome-screen";
import LoginScreen from "../pages/Auth/Login-screen";
import RegisterScreen from "../pages/Auth/Register-screen";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
