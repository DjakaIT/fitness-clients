import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
} from "react-native";

import { useFonts } from "expo-font";


const colors = {
  background: "#ffffff",
  accent: "#FFE4E6", 
  accentDark: "#ba4984",    
  text: "#761045",
  textMuted: "#717182",
  ctaText: "#9E3C6E",
};;

export default function HomeScreen({ navigation }) {
  const goLogin = () => navigation?.navigate?.("Login");

   const [loaded] = useFonts({
    LatoRegular: require("../../assets/fonts/Lato-Regular.ttf"),
    LatoBold: require("../../assets/fonts/Lato-Bold.ttf"),
  });


if(!loaded){
    return null;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        {/* TOP GROUP */}
        <View style={styles.header}>
          <View style={styles.logoPlaceholder}>
            <Image
              source={require("../../assets/images/logo.jpeg")}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>

          <Text style={styles.subtitle}>Tvoj vodič do promjene</Text>
        </View>

        {/* BOTTOM CTA */}
        <Pressable
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          onPress={goLogin}
        >
          <Text style={styles.ctaText}>Prijavi se</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: "100%",
    backgroundColor: colors.background,
  },

  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },

  header: {
    alignItems: "center",
    width: "100%",
  },

  logoPlaceholder: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.ctaText,
    borderWidth: 3,
    borderColor: colors.accent,
    overflow: "hidden",
    marginBottom: 5,
  },

  logo: {
    width: "100%",
    height: "100%",
  },

  subtitle: {
    fontFamily: "LatoBold",
    fontSize: 16,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 10
  },

  cta: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: -30,
  },

  ctaPressed: {
    backgroundColor: colors.accentDark,
  },

  ctaText: {
    fontFamily: "LatoBold",
    color: colors.ctaText,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "LatoBold",
  },
});
