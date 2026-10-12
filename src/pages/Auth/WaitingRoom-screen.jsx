import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../context/AuthContext";
import AuthBackdrop from "../../components/AuthBackdrop";
import FadeInView from "../../components/FadeInView";
import DeleteAccountSheet from "../../components/DeleteAccountSheet";
import useReducedMotion from "../../hooks/useReducedMotion";
import { styles } from "../../styles/Auth/StylesWaitingRoomScreen";

/**
 * Where a client waits for the trainer's approval — the same calm, cream
 * world as the login she has just come from, so being "not in yet" feels
 * like a pause, not a wall. The approval arrives live (AuthContext listens to
 * her profile), so the screen simply gives way to the app; nothing to tap.
 */
export default function WaitingRoomScreen() {
  const { user, status, logout } = useAuth();
  const [deleteVisible, setDeleteVisible] = useState(false);
  const reducedMotion = useReducedMotion();
  const breath = useRef(new Animated.Value(0)).current;

  const isRejected = status === "rejected";
  const firstName = user?.displayName?.split(" ")[0] ?? "";

  // A slow breath around the logo: the app is waiting with her, not frozen.
  useEffect(() => {
    if (reducedMotion || isRejected) {
      breath.setValue(0);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breath, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breath, reducedMotion, isRejected]);

  const haloScale = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });
  const haloOpacity = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.7],
  });

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <AuthBackdrop>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <FadeInView delay={100}>
              <View style={styles.logoWrap}>
                <Animated.View
                  style={[
                    styles.halo,
                    { opacity: haloOpacity, transform: [{ scale: haloScale }] },
                  ]}
                />
                <View style={styles.logoCard}>
                  <Image
                    source={require("../../../assets/images/logo.jpeg")}
                    style={styles.logo}
                    resizeMode="cover"
                  />
                </View>
              </View>
            </FadeInView>

            <FadeInView delay={260} style={styles.textBlock}>
              {!!firstName && (
                <Text style={styles.greeting}>Hej, {firstName}!</Text>
              )}
              {isRejected ? (
                <>
                  <Text style={styles.message} accessibilityRole="header">
                    Tvoj zahtjev ovaj put nije odobren
                  </Text>
                  <Text style={styles.subtitle}>
                    Za više informacija javi se trenerici — rado će ti
                    pomoći.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.message} accessibilityRole="header">
                    Još malo pa će te trenerica odobriti, daj koju minutu i
                    tvoja promjena počinje!
                  </Text>
                  <View style={styles.dots} accessibilityElementsHidden>
                    {[0, 1, 2].map((i) => (
                      <Dot key={i} index={i} still={reducedMotion} />
                    ))}
                  </View>
                </>
              )}
            </FadeInView>
          </View>

          <FadeInView delay={420} style={styles.bottomActions}>
            <Pressable
              style={styles.logoutBtn}
              onPress={logout}
              accessibilityRole="button"
            >
              <Text style={styles.logoutText}>Odjava</Text>
            </Pressable>
            {/* Signing in created an account; she must be able to remove
                it without ever being approved. */}
            <Pressable
              style={styles.deleteLink}
              onPress={() => setDeleteVisible(true)}
              accessibilityRole="button"
            >
              <Text style={styles.deleteLinkText}>Obriši račun</Text>
            </Pressable>
          </FadeInView>
        </SafeAreaView>
      </AuthBackdrop>
      <DeleteAccountSheet
        visible={deleteVisible}
        onClose={() => setDeleteVisible(false)}
      />
    </View>
  );
}

/** One of three dots that rise in turn — "on its way". */
function Dot({ index, still }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (still) return undefined;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(index * 180),
        Animated.timing(v, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(v, {
          toValue: 0,
          duration: 420,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay((2 - index) * 180 + 300),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, index, still]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
          transform: [
            {
              translateY: v.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -5],
              }),
            },
          ],
        },
      ]}
    />
  );
}
