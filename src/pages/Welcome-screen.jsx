import React from "react";
import { View, Text, Image, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import GeneralButton from "../components/GeneralButton";
import { useFonts } from "expo-font";
import { useNavigation } from "@react-navigation/native";
import { styles } from "../styles/StylesWelcomeScreen";

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
