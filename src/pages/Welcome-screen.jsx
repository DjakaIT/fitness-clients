import React, { useEffect, useRef } from "react";
import { View, Text, Image, Pressable, Animated, Easing } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import AuthBackdrop from "../components/AuthBackdrop";
import FadeInView from "../components/FadeInView";
import { styles } from "../styles/StylesWelcomeScreen";

export default function WelcomeScreen() {
  const navigation = useNavigation();

  const enter = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 2800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 2800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [enter, float]);

  const enterScale = enter.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] });
  const enterY = enter.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });
  const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <AuthBackdrop>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <Animated.View
              style={{
                opacity: enter,
                transform: [{ translateY: enterY }, { scale: enterScale }],
              }}
            >
              <Animated.View
                style={[styles.logoCard, { transform: [{ translateY: floatY }] }]}
              >
                <Image
                  source={require("../../assets/images/logo.jpeg")}
                  style={styles.logo}
                  resizeMode="cover"
                />
              </Animated.View>
            </Animated.View>

            <FadeInView delay={350}>
              <View style={styles.divider} />
            </FadeInView>
            <FadeInView delay={450}>
              <Text style={styles.tagline}>Tvoj vodič do promjene</Text>
            </FadeInView>
          </View>

          <FadeInView delay={620} style={styles.footer}>
            <Pressable
              style={styles.button}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.buttonText}>ZAPOČNI</Text>
            </Pressable>
          </FadeInView>
        </SafeAreaView>
      </AuthBackdrop>
    </View>
  );
}
