import React from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import GeneralButton from "../components/GeneralButton";
import { useFonts } from "expo-font";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

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

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const [loaded] = useFonts({
    LatoRegular: require("../../assets/fonts/Lato-Regular.ttf"),
    LatoBold: require("../../assets/fonts/Lato-Bold.ttf"),
  });

  if (!loaded) return null;

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" />

      <LinearGradient
        colors={[colors.bgSoft, colors.bgDeep]}
        style={styles.background}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.logoFrame}>
              <Image
                source={require("../../assets/images/logo.jpeg")}
                style={styles.logo}
                resizeMode="cover"
              />
            </View>

            <View style={styles.textGroup}>
              <Text style={styles.title}>MARTA</Text>
              <Text style={styles.titleHighlight}>FITNESS</Text>

              <View style={styles.accentLine} />

              <Text style={styles.subtitle}>Tvoj vodič do promjene.</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <GeneralButton
              onPress={() => navigation.navigate("Login")}
              colors={[colors.btnStart, colors.btnEnd]}
              size="lg"
              fullWidth
              style={styles.noFrameButton}
              textStyle={styles.buttonText}
            >
              ZAPOČNI
            </GeneralButton>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 35,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  logoFrame: {
    width: width * 0.48,
    height: width * 0.48,
    borderRadius: 999,
    padding: 6,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    marginBottom: 40,
  },
  logo: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
  },

  textGroup: {
    alignItems: "center",
  },
  title: {
    fontFamily: "LatoBold",
    fontSize: 52,
    color: colors.textPrimary,
    letterSpacing: -2,
    lineHeight: 50,
  },
  titleHighlight: {
    fontFamily: "LatoBold",
    fontSize: 52,
    color: colors.btnStart,
    letterSpacing: -2,
    lineHeight: 50,
  },
  accentLine: {
    width: 50,
    height: 3,
    backgroundColor: "#FFFFFF",
    marginVertical: 25,
    borderRadius: 2,
    opacity: 0.8,
  },
  subtitle: {
    fontFamily: "LatoRegular",
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: "center",
    letterSpacing: 1,
  },

  footer: {
    paddingBottom: 40,
  },
  noFrameButton: {
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
    borderRadius: 100,
  },
  buttonText: {
    fontFamily: "LatoBold",
    color: colors.bgDeep,
    fontSize: 16,
    letterSpacing: 2,
  },
});
