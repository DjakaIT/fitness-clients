import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../context/AuthContext";
import AuthNavigator from "./AuthNavigator";
import TabNavigator from "./TabNavigator";
import AdminNavigator from "./AdminNavigator";

export default function RootNavigator() {
  const { isAuthenticated, loading, isAdmin } = useAuth();
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return isAuthenticated ? (
    isAdmin ? (
      <AdminNavigator />
    ) : (
      <TabNavigator />
    )
  ) : (
    <AuthNavigator />
  );
}
