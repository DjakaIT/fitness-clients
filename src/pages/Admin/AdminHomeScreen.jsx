import React from "react";
import { Text, View, Image, StyleSheet } from "react-native";
import GeneralButton from "../../components/GeneralButton";
import { useNavigation } from "@react-navigation/native";

export default function AdminHomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>
        Dobrodošla nazad,{"\n"}
        <Text style={styles.name}>Marta.</Text>
      </Text>

      <View style={styles.imageWrapper}>
        <View style={styles.imageBorder}>
          <Image
            source={require("../../../assets/images/logo.jpeg")}
            style={styles.profileImage}
          />
        </View>
      </View>

      <Text style={styles.brandText}>MARTA FITNESS</Text>

      <Text style={styles.description}>
        Iza ovog ekrana stoje{"\n"}djevojke koje s tobom grade{"\n"}bolju
        budućnost, zato je ova{"\n"}aplikacija tu da ti olakša.
      </Text>

      <View style={styles.buttonContainer}>
        <GeneralButton
          onPress={() => navigation.navigate("AdminUserList")}
          colors={["#7C3AED", "#7C3AED"]}
          size="lg"
          fullWidth
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>Tvoje klijentice</Text>
            <Text style={styles.buttonArrow}>→</Text>
          </View>
        </GeneralButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  greeting: {
    fontFamily: "Montserrat_800ExtraBold",
    fontSize: 32,
    color: "#1A1A1A",
    textAlign: "center",
    lineHeight: 40,
  },
  name: {
    fontFamily: "Montserrat_800ExtraBold",
    fontSize: 32,
    color: "#7C3AED",
  },
  imageWrapper: {
    marginTop: 24,
    marginBottom: 16,
    alignItems: "center",
  },
  imageBorder: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    borderColor: "#E5E7EB",
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    backgroundColor: "#FFFFFF",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 90,
  },
  brandText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    letterSpacing: 6,
    color: "#9CA3AF",
    marginTop: 12,
    marginBottom: 28,
  },
  description: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 40,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 8,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  buttonText: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  buttonArrow: {
    fontSize: 20,
    color: "#FFFFFF",
  },
});
