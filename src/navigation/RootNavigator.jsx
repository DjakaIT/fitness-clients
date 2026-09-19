import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../context/AuthContext";
import AuthNavigator from "./AuthNavigator";
import TabNavigator from "./TabNavigator";
import AdminNavigator from "./AdminNavigator";
import InPersonNavigator from "./InPersonNavigator";
import WaitingRoomScreen from "../pages/Auth/WaitingRoom-screen";

export default function RootNavigator() {
  const { isAuthenticated, loading, isAdmin, status, trainingType } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#7C3AED" />
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

  if (trainingType === "in_person") return <InPersonNavigator />;
  return <TabNavigator />;
}
