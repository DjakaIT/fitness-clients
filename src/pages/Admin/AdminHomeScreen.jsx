import React from "react";
import { Text, View } from "react-native";
import ProfilePageComponent from "../../components/ProfilePageComponent";

export default function AdminHomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Pozdrav, Marta!</Text>
      <ProfilePageComponent />
    </View>
  );
}
