import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { sharedScreenOptions } from "./navigationConfig";
import AdminHomeScreen from "../pages/Admin/AdminHomeScreen";
import AdminUserListScreen from "../pages/Admin/AdminUserListScreen";
import AdminUserImpressionScreen from "../pages/Admin/AdminUserImpressionScreen";
import AdminInPersonScreen from "../pages/Admin/AdminInPersonScreen";
import AdminClientScheduleScreen from "../pages/Admin/AdminClientScheduleScreen";
import AdminTrainerTimeScreen from "../pages/Admin/AdminTrainerTimeScreen.jsx";
import AdminTrainerSavedTimeScreen from "../pages/Admin/AdminTrainerSavedTimeScreen";
import AdminClientGeneralScreen from "../pages/Admin/AdminClientGeneralScreen";
import AdminWorkoutBuilderScreen from "../pages/Admin/AdminWorkoutBuilderScreen";

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
      <Admin.Screen
        name="AdminTrainerTime"
        component={AdminTrainerTimeScreen}
        options={{ title: "Dodaj vrijeme" }}
      />
      <Admin.Screen
        name="AdminTrainerSavedTime"
        component={AdminTrainerSavedTimeScreen}
        options={{ title: "Spremljeno vrijeme" }}
      />
      <Admin.Screen
        name="AdminClientGeneralScreen"
        component={AdminClientGeneralScreen}
        options={{ title: "Opći podaci klijenta" }}
      />
      <Admin.Screen
        name="AdminWorkoutBuilder"
        component={AdminWorkoutBuilderScreen}
        options={{ title: "Program vježbanja" }}
      />
    </Admin.Navigator>
  );
}
