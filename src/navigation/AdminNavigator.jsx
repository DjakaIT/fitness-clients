import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { sharedScreenOptions } from "./navigationConfig";
import AdminHomeScreen from "../pages/Admin/AdminHomeScreen";
import AdminUserListScreen from "../pages/Admin/AdminUserListScreen";
import AdminUserImpressionScreen from "../pages/Admin/AdminUserImpressionScreen";

export default function AdminNavigator() {
  const Admin = createNativeStackNavigator();
  return (
    <Admin.Navigator screenOptions={sharedScreenOptions}>
      <Admin.Screen
        name="AdminHome"
        component={AdminHomeScreen}
        options={{ title: "Admin Dashboard" }}
      />
      <Admin.Screen
        name="AdminUserList"
        component={AdminUserListScreen}
        options={{ title: "List of users" }}
      />
      <Admin.Screen
        name="AdminUserImpression"
        component={AdminUserImpressionScreen}
        options={{ title: "User Impression" }}
      />
      <Admin.Screen
        name="AdminAppointments"
        component={AdminAppointmentScreen}
        options={{ title: "Appointments" }}
      />
    </Admin.Navigator>
  );
}
