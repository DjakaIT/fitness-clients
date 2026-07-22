import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useGoogleAuth } from "../../hooks/auth/useGoogleAuth";
import AuthBackdrop from "../../components/AuthBackdrop";
import FadeInView from "../../components/FadeInView";
import { styles } from "../../styles/Auth/StylesLoginScreen";
import { AUTH } from "../../styles/authTheme";

export default function LoginScreen() {
  const { signIn, loading } = useGoogleAuth();

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <AuthBackdrop>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <FadeInView delay={100}>
              <View style={styles.logoCard}>
                <Image
                  source={require("../../../assets/images/logo.jpeg")}
                  style={styles.logo}
                  resizeMode="cover"
                />
              </View>
            </FadeInView>

            <FadeInView delay={250} style={{ alignItems: "center" }}>
              <Text style={styles.title}>Dobrodošla!</Text>
              <Text style={styles.subtitle}>
                Prijavi se sa Google računom da nastaviš
              </Text>
            </FadeInView>

            <FadeInView delay={420} style={styles.buttonWrap}>
              <TouchableOpacity
                onPress={signIn}
                disabled={loading}
                style={[styles.googleButton, loading && styles.buttonDisabled]}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color={AUTH.accent} />
                ) : (
                  <>
                    <Image
                      source={{
                        uri: "https://developers.google.com/identity/images/g-logo.png",
                      }}
                      style={styles.googleIcon}
                    />
                    <Text style={styles.googleButtonText}>
                      Nastavi s Google računom
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Prijavom prihvaćaš uvjete korištenja
                </Text>
              </View>
            </FadeInView>
          </View>
        </SafeAreaView>
      </AuthBackdrop>
    </View>
  );
}
