import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AuthNavigator from "./AuthNavigator";
import TabNavigator from "./TabNavigator";
import AdminNavigator from "./AdminNavigator";
import WaitingRoomScreen from "../pages/Auth/WaitingRoom-screen";
import GoalSurveyScreen from "../pages/Auth/GoalSurvey-screen";

export default function RootNavigator() {
  const { isAuthenticated, loading, isAdmin, status, goal } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.bg,
        }}
      >
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  if (!isAuthenticated) return <AuthNavigator />;
  if (isAdmin) return <AdminNavigator />;

  // Anything that is not exactly "active" is not approved. This used to name
  // the blocked states instead, so a status the model does not know about —
  // "inactive" exists in production — fell through into the full app, where
  // firestore.rules then denied every read. The client got empty screens and
  // spinners rather than an explanation. Fail closed, and match the rules,
  // which also test for "active" exactly.
  if (status !== "active") return <WaitingRoomScreen />;

  // Approved, but she has not said what she is working towards yet. Her
  // progress is measured against that goal, so it is asked once, here —
  // including for clients approved before the survey existed.
  if (!goal) return <GoalSurveyScreen />;

  return <TabNavigator />;
}
