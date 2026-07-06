import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import ProfilePageComponent from "../../components/ProfilePageComponent";
import GeneralButton from "../../components/GeneralButton";
import { StyleSheet } from "react-native";

export default function AdminClientGeneralScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { userId, displayName } = params ?? {};

  return (
    <SafeAreaView style={s.safeArea}>
      <ProfilePageComponent />
      <View style={s.container}>
        <Text style={s.title}>{displayName}</Text>
        <Text style={s.subtitle}>Online klijentica</Text>

        <View style={s.section}>
          <GeneralButton
            colors={["#7C3AED", "#14b8a6"]}
            fullWidth
            onPress={() =>
              navigation.navigate("AdminWorkoutBuilder", {
                userId,
                displayName,
              })
            }
          >
            Program vježbanja
          </GeneralButton>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1, paddingHorizontal: 20 },
  title: {
    fontSize: 22,
    fontFamily: "Outfit_700Bold",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    marginBottom: 28,
  },
  section: { gap: 12 },
});
