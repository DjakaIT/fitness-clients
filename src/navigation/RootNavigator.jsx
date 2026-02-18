import { useAuth } from "../context/AuthContext";
import AuthNavigator from "./AuthNavigator";
import TabNavigator from "./TabNavigator";
export default function RootNavigator() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <TabNavigator /> : <AuthNavigator />;
}
