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
import * as AppleAuthentication from "expo-apple-authentication";
import { useGoogleAuth } from "../../hooks/auth/useGoogleAuth";
import { useAppleAuth } from "../../hooks/auth/useAppleAuth";
import AuthBackdrop from "../../components/AuthBackdrop";
import FadeInView from "../../components/FadeInView";
import {
  styles,
  APPLE_BUTTON_HEIGHT,
} from "../../styles/Auth/StylesLoginScreen";
import { AUTH } from "../../styles/authTheme";

export default function LoginScreen() {
  const google = useGoogleAuth();
  const apple = useAppleAuth();

  // One sign-in at a time: starting Apple while Google's sheet is still
  // resolving (or the reverse) would race two onAuthStateChanged events.
  const busy = google.loading || apple.loading;
  const error = apple.error ?? google.error;

  const signInWithGoogle = () => {
    apple.clearError();
    google.signIn();
  };
  const signInWithApple = () => {
    google.clearError();
    apple.signIn();
  };

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
                {apple.available
                  ? "Prijavi se da nastaviš"
                  : "Prijavi se sa Google računom da nastaviš"}
              </Text>
            </FadeInView>

            <FadeInView delay={420} style={styles.buttonWrap}>
              {apple.available && (
                // Apple's own control, as its guidelines require: it renders
                // the label in the phone's language and keeps the approved
                // look. Sized to match the Google button so neither option
                // is more prominent than the other.
                <View
                  style={[
                    styles.appleButtonWrap,
                    busy && styles.buttonDisabled,
                  ]}
                  pointerEvents={busy ? "none" : "auto"}
                >
                  {apple.loading ? (
                    <View style={styles.appleButtonBusy}>
                      <ActivityIndicator color="#FFFFFF" />
                    </View>
                  ) : (
                    <AppleAuthentication.AppleAuthenticationButton
                      buttonType={
                        AppleAuthentication.AppleAuthenticationButtonType
                          .CONTINUE
                      }
                      buttonStyle={
                        AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                      }
                      cornerRadius={18}
                      style={{ width: "100%", height: APPLE_BUTTON_HEIGHT }}
                      onPress={signInWithApple}
                    />
                  )}
                </View>
              )}

              <TouchableOpacity
                onPress={signInWithGoogle}
                disabled={busy}
                style={[styles.googleButton, busy && styles.buttonDisabled]}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityState={{ disabled: busy, busy: google.loading }}
              >
                {google.loading ? (
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

              {!!error && (
                <Text style={styles.errorText} accessibilityRole="alert">
                  {error}
                </Text>
              )}

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
