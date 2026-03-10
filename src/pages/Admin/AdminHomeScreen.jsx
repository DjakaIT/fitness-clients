import React from "react";
import { Text, View } from "react-native";
import ProfilePageComponent from "../../components/ProfilePageComponent";
import GeneralButton from "../../components/GeneralButton";
import { useNavigation } from "@react-navigation/native";

export default function AdminHomeScreen() {
  const navigation = useNavigation();
  const colors = {
    bgDeep: "#4b0622",
    bgSoft: "#654b55",

    // Typography
    textPrimary: "#FFFFFF",
    textSecondary: "#DBC1C9",

    // Button
    btnStart: "#F497BA",
    btnEnd: "#F2829E",
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Pozdrav, Marta!</Text>
      <GeneralButton
        onPress={() => navigation.navigate("AdminUserList")}
        colors={[colors.btnStart, colors.btnEnd]}
        size="lg"
        fullWidth
      >
        Klijentice
      </GeneralButton>
      <ProfilePageComponent />
    </View>
  );
}
