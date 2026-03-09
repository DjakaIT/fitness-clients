import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { sharedScreenOptions } from "./navigationConfig";
import AdminHomeScreen from "../pages/Admin/AdminHomeScreen";

export default function AdminNavigator() {
  const Admin = createNativeStackNavigator();
  return (
    <Admin.Navigator screenOptions={sharedScreenOptions}>
      <Admin.Screen
        name="AdminHome"
        component={AdminHomeScreen}
        options={{ title: "Admin Dashboard" }}
      />
    </Admin.Navigator>
  );
}
