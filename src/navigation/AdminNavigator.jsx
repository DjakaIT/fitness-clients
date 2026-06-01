import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { sharedScreenOptions } from "./navigationConfig";
import AdminHomeScreen from "../pages/Admin/AdminHomeScreen";
import AdminUserListScreen from "../pages/Admin/AdminUserListScreen";
import AdminUserImpressionScreen from "../pages/Admin/AdminUserImpressionScreen";
import AdminInPersonScreen from "../pages/Admin/AdminInPersonScreen";
import AdminClientScheduleScreen from "../pages/Admin/AdminClientScheduleScreen";

const Admin = createNativeStackNavigator();

export default function AdminNavigator() {
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
        options={{ title: "Online klijentice" }}
      />
      <Admin.Screen
        name="AdminUserImpression"
        component={AdminUserImpressionScreen}
        options={{ title: "Dojmovi" }}
      />
      <Admin.Screen
        name="AdminInPerson"
        component={AdminInPersonScreen}
        options={{ title: "Uživo klijentice" }}
      />
      <Admin.Screen
        name="AdminClientSchedule"
        component={AdminClientScheduleScreen}
        options={{ title: "Raspored" }}
      />
    </Admin.Navigator>
  );
}
