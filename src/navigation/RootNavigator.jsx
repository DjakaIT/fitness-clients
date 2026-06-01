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
  if (status === "pending" || status === "rejected")
    return <WaitingRoomScreen />;
  if (trainingType === "in_person") return <InPersonNavigator />;
  return <TabNavigator />;
}
